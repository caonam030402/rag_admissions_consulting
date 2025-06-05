import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import io from "socket.io-client";

import { TRIGGER_CONTACT_CABINET } from "@/constants/common";
import { ActorType } from "@/enums/systemChat";
import type { HumanHandoffStatus } from "@/services/humanHandoff";
import { humanHandoffService } from "@/services/humanHandoff";
import { useChatStore } from "@/stores/chat";

interface UseHumanHandoffProps {
  conversationId: string | null;
}

interface UseHumanHandoffReturn {
  // Status
  status: HumanHandoffStatus | undefined;
  isLoading: boolean;

  // Actions
  requestHumanSupport: (message: string) => void;
  endHandoff: () => void;

  // State
  timeoutRemaining: number;
  isWaiting: boolean;
  isConnected: boolean;
  adminName?: string;
}

export const useHumanHandoff = ({
  conversationId,
}: UseHumanHandoffProps): UseHumanHandoffReturn => {
  const [timeoutRemaining, setTimeoutRemaining] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [adminName, setAdminName] = useState<string>();
  const [sessionId, setSessionId] = useState<string>();

  // Chat store for adding messages
  const { addMessage } = useChatStore();

  // Queries and mutations
  const { data: status, isLoading } = humanHandoffService.useHandoffStatus(
    conversationId || "",
  );
  const requestMutation = humanHandoffService.useRequestHumanSupport();
  const endMutation = humanHandoffService.useEndHandoff();

  // Handle human support request
  const requestHumanSupport = useCallback(
    (message: string) => {
      console.log("🔧 DEBUG - requestHumanSupport called with:", message);
      console.log("🔧 DEBUG - conversationId:", conversationId);

      if (!conversationId) {
        console.log("🔧 DEBUG - No conversationId, showing error toast");
        toast.error("Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại.");
        return;
      }

      const request = humanHandoffService.createHandoffRequest(
        conversationId,
        message,
      );

      console.log("🔧 DEBUG - Created request:", request);

      requestMutation.mutate(request, {
        onSuccess: (session) => {
          console.log("🔧 DEBUG - Request success:", session);
          setSessionId(session.id);
          setIsWaiting(true);
          setIsConnected(false);

          // Start 60-second timeout
          const clearTimeoutFn = humanHandoffService.startTimeout(
            conversationId,
            () => {
              // Timeout reached - go back to chatbot
              setIsWaiting(false);
              setTimeoutRemaining(0);
              toast.error(
                "Không tìm được cán bộ tư vấn. Hệ thống sẽ tiếp tục hỗ trợ bạn.",
              );
            },
            (remaining) => {
              setTimeoutRemaining(remaining);
            },
          );

          // Store cleanup function
          window.humanHandoffCleanup = clearTimeoutFn;
        },
        onError: (error) => {
          console.log("🔧 DEBUG - Request error:", error);
          setIsWaiting(false);
          setTimeoutRemaining(0);
        },
      });
    },
    [conversationId, requestMutation],
  );

  // Handle ending handoff
  const endHandoff = useCallback(() => {
    if (sessionId) {
      endMutation.mutate(sessionId, {
        onSuccess: () => {
          setIsWaiting(false);
          setIsConnected(false);
          setAdminName(undefined);
          setSessionId(undefined);
          setTimeoutRemaining(0);

          // Clear timeout
          if (window.humanHandoffCleanup) {
            window.humanHandoffCleanup();
            window.humanHandoffCleanup = undefined;
          }
        },
      });
    }
  }, [sessionId, endMutation]);

  // Socket event handlers
  useEffect(() => {
    if (!conversationId) return;

    console.log(
      "🔧 DEBUG - Setting up socket for conversationId:",
      conversationId,
    );

    // Direct socket implementation to avoid service issues
    const socketInstance = io(
      `${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"}/human-handoff`,
      {
        transports: ["websocket"],
        query: { conversationId },
      },
    );

    // Listen for admin acceptance
    socketInstance.on("human-support-accepted", (data: { sessionId: string; adminName: string }) => {
      console.log("🔧 DEBUG - Support accepted:", data);
      setIsWaiting(false);
      setIsConnected(true);
      setAdminName(data.adminName);
      setTimeoutRemaining(0);

      if (window.humanHandoffCleanup) {
        window.humanHandoffCleanup();
        window.humanHandoffCleanup = undefined;
      }

      toast.success(`Đã kết nối với ${data.adminName}`);
    });

    // Listen for session end
    socketInstance.on("human-support-ended", () => {
      console.log("🔧 DEBUG - Support ended");
      setIsWaiting(false);
      setIsConnected(false);
      setAdminName(undefined);
      setSessionId(undefined);
      setTimeoutRemaining(0);

      toast("Cán bộ tư vấn đã kết thúc phiên hỗ trợ");
    });

    // Listen for admin messages
    socketInstance.on("human-message", (data: { message: string; adminName: string }) => {
      console.log("🔧 DEBUG - Received admin message:", data);
      addMessage({
        id: Date.now().toString(),
        content: data.message,
        role: ActorType.Bot,
        timestamp: Date.now(),
        conversationId,
      });

      toast(`Tin nhắn từ ${data.adminName}`);
    });

    socketInstance.connect();
    console.log("🔧 DEBUG - Socket connected");

    return () => {
      console.log("🔧 DEBUG - Cleaning up socket");
      socketInstance.disconnect();
    };
  }, [conversationId, addMessage]);

  // Update state from server status
  useEffect(() => {
    if (status) {
      setIsWaiting(status.isWaiting);
      setIsConnected(status.isConnected);
      setAdminName(status.adminName);
      if (status.timeoutRemaining) {
        setTimeoutRemaining(status.timeoutRemaining);
      }
    }
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.humanHandoffCleanup) {
        window.humanHandoffCleanup();
        window.humanHandoffCleanup = undefined;
      }
    };
  }, []);

  return {
    status,
    isLoading,
    requestHumanSupport,
    endHandoff,
    timeoutRemaining,
    isWaiting,
    isConnected,
    adminName,
  };
};

// Global window interface for cleanup function
declare global {
  interface Window {
    humanHandoffCleanup?: () => void;
  }
}

export const shouldTriggerHumanHandoff = (message: string): boolean => {
  const trimmed = message.trim();
  const result = trimmed === TRIGGER_CONTACT_CABINET;

  console.log("🔧 DEBUG - shouldTriggerHumanHandoff:", {
    message,
    trimmed,
    TRIGGER_CONTACT_CABINET,
    result,
  });

  return result;
};

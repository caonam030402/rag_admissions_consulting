import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  const [timeoutInterval, setTimeoutInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Chat store for adding messages
  const { addMessage } = useChatStore();

  // Queries and mutations
  const { data: status, isLoading } = humanHandoffService.useHandoffStatus(
    conversationId || ""
  );
  const requestMutation = humanHandoffService.useRequestHumanSupport();
  const endMutation = humanHandoffService.useEndHandoff();

  // Clear timeout helper
  const clearTimeoutHandler = useCallback(() => {
    if (timeoutInterval) {
      clearInterval(timeoutInterval);
      setTimeoutInterval(null);
    }
    setTimeoutRemaining(0);
  }, [timeoutInterval]);

  // Start timeout for waiting state
  const startTimeout = useCallback(() => {
    clearTimeoutHandler();

    let remaining = 60000; // 60 seconds
    setTimeoutRemaining(remaining);

    const interval = setInterval(() => {
      remaining -= 1000;
      setTimeoutRemaining(Math.max(0, remaining));

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeoutInterval(null);
        setIsWaiting(false);
        toast.error(
          "Không tìm được cán bộ tư vấn. Hệ thống sẽ tiếp tục hỗ trợ bạn."
        );
      }
    }, 1000);

    setTimeoutInterval(interval);
  }, [clearTimeoutHandler]);

  // Handle human support request
  const requestHumanSupport = useCallback(
    (message: string) => {
      console.log("🚀 Starting human support request with message:", message);

      if (!conversationId) {
        toast.error("Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại.");
        return;
      }

      const request = humanHandoffService.createHandoffRequest(
        conversationId,
        message
      );

      console.log("📝 Created handoff request:", request);

      requestMutation.mutate(request, {
        onSuccess: (session) => {
          console.log("✅ Handoff request successful:", session);
          setSessionId(session.id);
          setIsWaiting(true);
          setIsConnected(false);
          startTimeout();
        },
        onError: (error) => {
          console.error("❌ Handoff request failed:", error);
          setIsWaiting(false);
          clearTimeoutHandler();
        },
      });
    },
    [conversationId, requestMutation, startTimeout, clearTimeoutHandler]
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
          clearTimeoutHandler();
        },
      });
    }
  }, [sessionId, endMutation, clearTimeoutHandler]);

  // Socket event handlers
  useEffect(() => {
    if (!conversationId) return;

    // Connect socket
    humanHandoffService.connectSocket(conversationId);

    // Setup listeners
    const cleanup = humanHandoffService.setupSocketListeners({
      onSupportAccepted: (data) => {
        setIsWaiting(false);
        setIsConnected(true);
        setAdminName(data.adminName);
        clearTimeoutHandler();
        toast.success(`Đã kết nối với ${data.adminName}`);
      },

      onSupportEnded: () => {
        setIsWaiting(false);
        setIsConnected(false);
        setAdminName(undefined);
        setSessionId(undefined);
        clearTimeoutHandler();
        toast("Cán bộ tư vấn đã kết thúc phiên hỗ trợ");
      },

      onHumanMessage: (data) => {
        addMessage({
          id: Date.now().toString(),
          content: data.message,
          role: ActorType.Bot,
          timestamp: Date.now(),
          conversationId,
        });
        toast(`Tin nhắn từ ${data.adminName}`);
      },
    });

    return () => {
      cleanup();
      humanHandoffService.disconnectSocket();
    };
  }, [conversationId, addMessage, clearTimeoutHandler]);

  // Update state from server status
  useEffect(() => {
    if (status) {
      setIsWaiting(status.isWaiting);
      setIsConnected(status.isConnected);
      setAdminName(status.adminName);

      if (status.timeoutRemaining && status.isWaiting) {
        setTimeoutRemaining(status.timeoutRemaining);
      }
    }
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeoutHandler();
    };
  }, [clearTimeoutHandler]);

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

export const shouldTriggerHumanHandoff = (message: string): boolean => {
  const trimmed = message.trim();
  return trimmed === TRIGGER_CONTACT_CABINET;
};

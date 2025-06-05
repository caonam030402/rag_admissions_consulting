import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { io, type Socket } from "socket.io-client";

import { ENameLocalS } from "@/constants";
import { useQueryCommon } from "@/hooks/useQuery";
import { getLocalStorage } from "@/utils/clientStorage";
import http from "@/utils/http";

// Types
export interface HumanHandoffRequest {
  conversationId: string;
  userId?: number;
  guestId?: string;
  message: string;
  userProfile?: {
    name?: string;
    email?: string;
  };
}

export interface HumanHandoffSession {
  id: string;
  conversationId: string;
  userId?: number;
  guestId?: string;
  adminId?: number;
  status: "waiting" | "connected" | "ended" | "timeout";
  requestedAt: Date;
  connectedAt?: Date;
  endedAt?: Date;
  initialMessage: string;
  userProfile?: {
    name?: string;
    email?: string;
  };
}

export interface AdminNotification {
  id: string;
  sessionId: string;
  conversationId: string;
  userId?: number;
  guestId?: string;
  status: "waiting" | "connected" | "ended" | "timeout";
  userProfile?: {
    name?: string;
    email?: string;
  };
  initialMessage: string;
  requestedAt: Date;
}

export interface HumanHandoffStatus {
  isWaiting: boolean;
  isConnected: boolean;
  adminName?: string;
  timeoutRemaining?: number;
}

// Socket Management - Singleton Pattern
class SocketManager {
  private socket: Socket | null = null;
  private connectionPromise: Promise<Socket> | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private messageHistory: Map<string, Set<string>> = new Map(); // conversationId -> messageIds

  getSocket(): Socket {
    if (!this.socket) {
      console.log("🔄 Creating new socket connection...");

      this.socket = io(
        `${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"}/human-handoff`,
        {
          transports: ["websocket", "polling"],
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          forceNew: true,
        }
      );

      // Add connection event handlers
      this.socket.on("connect", () => {
        console.log("🟢 Socket connected successfully", this.socket?.id);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("🔴 Socket disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        console.error("Connection details:", {
          url: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
          namespace: "/human-handoff",
          transports: ["websocket", "polling"],
        });
      });

      this.socket.on("reconnect", (attemptNumber) => {
        console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      });

      this.socket.on("reconnecting", (attemptNumber) => {
        console.log("🔄 Socket reconnecting, attempt:", attemptNumber);
      });
    } else {
      console.log("♻️ Reusing existing socket connection");
    }
    return this.socket;
  }

  connect(conversationId?: string, adminId?: number) {
    const socket = this.getSocket();

    // Don't reconnect if already connected with same parameters
    const currentQuery = socket.io.opts.query as Record<string, string>;
    const newQuery: Record<string, string> = {};

    if (conversationId) {
      newQuery.conversationId = conversationId;
      console.log(
        `🔗 Connecting as user with conversationId: ${conversationId}`
      );
    }
    if (adminId) {
      newQuery.adminId = adminId.toString();
      console.log(`🔗 Connecting as admin with adminId: ${adminId}`);
    }

    // Check if we need to update connection parameters
    const needsReconnect =
      JSON.stringify(currentQuery) !== JSON.stringify(newQuery);

    if (needsReconnect) {
      console.log("🔄 Updating connection parameters...");
      socket.io.opts.query = newQuery;

      if (socket.connected) {
        socket.disconnect();
        setTimeout(() => {
          socket.connect();
          console.log(`📡 Socket reconnecting with new params...`);
        }, 100);
      } else {
        socket.connect();
        console.log(`📡 Socket connecting...`);
      }
    } else if (!socket.connected) {
      socket.connect();
      console.log(`📡 Socket connecting...`);
    } else {
      console.log(`✅ Socket already connected with correct params`);
    }

    // Listen for connection confirmation
    socket.off("connection-confirmed"); // Remove old listeners
    socket.on("connection-confirmed", (data) => {
      console.log(`🎉 Connection confirmed:`, data);
    });

    return socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event: string, callback: Function) {
    const socket = this.getSocket();
    socket.on(event, callback as any);

    // Store for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function) {
    const socket = this.getSocket();
    if (callback) {
      socket.off(event, callback as any);
    } else {
      socket.off(event);
      this.listeners.delete(event);
    }
  }

  emit(event: string, data: any) {
    const socket = this.getSocket();
    socket.emit(event, data);
  }

  cleanup() {
    if (this.socket) {
      // Remove all listeners
      for (const [event] of this.listeners) {
        this.socket.off(event);
      }
      this.listeners.clear();
    }
  }

  // Send message from user to admin
  async sendUserMessage(
    conversationId: string,
    message: string,
    guestId?: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const socket = this.getSocket();
      if (!socket?.connected) {
        console.error("❌ Socket not connected for user message");
        return false;
      }

      // Generate unique message ID to prevent duplicates
      const messageId = `user-${conversationId}-${message}-${Date.now()}`;

      // Check if message already sent recently
      const conversationHistory =
        this.messageHistory.get(conversationId) || new Set();
      const messageKey = `${message}-${Math.floor(Date.now() / 5000)}`; // 5-second window

      if (conversationHistory.has(messageKey)) {
        console.warn("⚠️ Duplicate message prevented:", message);
        return true; // Return true to avoid showing error
      }

      // Add to history
      conversationHistory.add(messageKey);
      this.messageHistory.set(conversationId, conversationHistory);

      // Clean up old entries (keep only last 50)
      if (conversationHistory.size > 50) {
        const entries = Array.from(conversationHistory);
        const toKeep = entries.slice(-25);
        this.messageHistory.set(conversationId, new Set(toKeep));
      }

      console.log("📤 Sending user message:", {
        conversationId,
        message,
        messageId,
      });

      // Store message locally first
      this.saveMessageToLocalHistory(conversationId, {
        id: messageId,
        message,
        sender: "user",
        timestamp: new Date(),
        guestId,
        userId,
      });

      socket.emit("send-user-message", {
        conversationId,
        message,
        guestId,
        userId,
        messageId,
      });

      return true;
    } catch (error) {
      console.error("❌ Error sending user message:", error);
      return false;
    }
  }

  // Send message from admin to user
  async sendAdminMessage(
    conversationId: string,
    message: string,
    adminId: string
  ): Promise<boolean> {
    try {
      const socket = this.getSocket();
      if (!socket?.connected) {
        console.error("❌ Socket not connected for admin message");
        return false;
      }

      // Generate unique message ID to prevent duplicates
      const messageId = `admin-${conversationId}-${message}-${Date.now()}`;

      // Check if message already sent recently
      const conversationHistory =
        this.messageHistory.get(conversationId) || new Set();
      const messageKey = `${message}-${Math.floor(Date.now() / 5000)}`; // 5-second window

      if (conversationHistory.has(messageKey)) {
        console.warn("⚠️ Duplicate admin message prevented:", message);
        return true;
      }

      // Add to history
      conversationHistory.add(messageKey);
      this.messageHistory.set(conversationId, conversationHistory);

      console.log("📤 Sending admin message:", {
        conversationId,
        message,
        messageId,
      });

      // Store message locally first
      this.saveMessageToLocalHistory(conversationId, {
        id: messageId,
        message,
        sender: "admin",
        timestamp: new Date(),
        adminId,
      });

      socket.emit("send-admin-message", {
        conversationId,
        message,
        adminId,
        messageId,
      });

      return true;
    } catch (error) {
      console.error("❌ Error sending admin message:", error);
      return false;
    }
  }

  // Save message to local storage for history
  private saveMessageToLocalHistory(conversationId: string, messageData: any) {
    try {
      const historyKey = `chat_history_${conversationId}`;
      const existing = localStorage.getItem(historyKey);
      const history = existing ? JSON.parse(existing) : [];

      // Prevent duplicates in local storage too
      const isDuplicate = history.some(
        (msg: any) =>
          msg.message === messageData.message &&
          msg.sender === messageData.sender &&
          Math.abs(
            new Date(msg.timestamp).getTime() -
              new Date(messageData.timestamp).getTime()
          ) < 5000
      );

      if (!isDuplicate) {
        history.push(messageData);

        // Keep only last 100 messages
        if (history.length > 100) {
          history.splice(0, history.length - 100);
        }

        localStorage.setItem(historyKey, JSON.stringify(history));
        console.log("💾 Message saved to local history");
      }
    } catch (error) {
      console.error("❌ Error saving to local history:", error);
    }
  }

  // Get local message history
  getLocalMessageHistory(conversationId: string): any[] {
    try {
      const historyKey = `chat_history_${conversationId}`;
      const existing = localStorage.getItem(historyKey);
      return existing ? JSON.parse(existing) : [];
    } catch (error) {
      console.error("❌ Error getting local history:", error);
      return [];
    }
  }
}

// Global socket manager instance
const socketManager = new SocketManager();

// Query keys
export const HUMAN_HANDOFF_QUERY_KEYS = {
  status: (conversationId: string) =>
    ["human-handoff", "status", conversationId] as const,
  sessions: ["human-handoff", "sessions"] as const,
  adminNotifications: ["human-handoff", "admin-notifications"] as const,
};

// Helper functions
const getCurrentUser = (): { userId?: number; guestId?: string } => {
  const userId = getLocalStorage({ key: ENameLocalS.USER_ID }) as number;
  let guestId = getLocalStorage({ key: ENameLocalS.GUEST_ID }) as string;

  // Generate guestId if not exists
  if (!userId && !guestId) {
    guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(ENameLocalS.GUEST_ID, guestId);
    console.log("🆔 Generated new guestId:", guestId);
  }

  console.log("🔧 DEBUG - getCurrentUser:", { userId, guestId });
  return { userId, guestId };
};

// Timeout handler
let timeoutHandler: NodeJS.Timeout | null = null;
const TIMEOUT_DURATION = 60000; // 60 seconds

const startTimeout = (
  conversationId: string,
  onTimeout: () => void,
  onUpdate: (timeRemaining: number) => void
) => {
  if (timeoutHandler) clearTimeout(timeoutHandler);

  let timeRemaining = TIMEOUT_DURATION;

  const intervalHandler = setInterval(() => {
    timeRemaining -= 1000;
    onUpdate(Math.max(0, timeRemaining));

    if (timeRemaining <= 0) {
      clearInterval(intervalHandler);
      onTimeout();
    }
  }, 1000);

  timeoutHandler = setTimeout(() => {
    clearInterval(intervalHandler);
    onTimeout();
  }, TIMEOUT_DURATION);

  return () => {
    clearTimeout(timeoutHandler!);
    clearInterval(intervalHandler);
  };
};

const clearTimeoutHandler = () => {
  if (timeoutHandler) {
    clearTimeout(timeoutHandler);
    timeoutHandler = null;
  }
};

export const humanHandoffService = {
  // Request human support
  useRequestHumanSupport: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (request: HumanHandoffRequest) => {
        const response = await http.post<HumanHandoffSession>(
          "human-handoff/request",
          {
            body: request,
          }
        );
        return response.payload;
      },
      onSuccess: (session) => {
        queryClient.invalidateQueries({
          queryKey: HUMAN_HANDOFF_QUERY_KEYS.status(session.conversationId),
        });

        // Emit socket event to notify admins
        const socketInstance = socketManager.connect();
        socketInstance.emit("human-support-requested", {
          sessionId: session.id,
          conversationId: session.conversationId,
          userProfile: session.userProfile,
          initialMessage: session.initialMessage,
          requestedAt: session.requestedAt,
        });

        toast.success("Đã gửi yêu cầu hỗ trợ. Vui lòng chờ trong giây lát...");
      },
      onError: () => {
        toast.error("Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại.");
      },
    });
  },

  // Get handoff status
  useHandoffStatus: (conversationId: string) => {
    return useQueryCommon<HumanHandoffStatus>({
      url: `human-handoff/status/${conversationId}`,
      queryKey: HUMAN_HANDOFF_QUERY_KEYS.status(conversationId),
      enabled: !!conversationId,
    });
  },

  // Admin: Get pending notifications
  useAdminNotifications: () => {
    return useQueryCommon<HumanHandoffSession[]>({
      url: "human-handoff/admin/notifications",
      queryKey: HUMAN_HANDOFF_QUERY_KEYS.adminNotifications,
      refetchInterval: 5000, // Poll every 5 seconds
    });
  },

  // Admin: Accept handoff session
  useAcceptHandoff: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (sessionId: string) => {
        const response = await http.post<HumanHandoffSession>(
          `human-handoff/admin/accept/${sessionId}`,
          {
            body: {},
          }
        );
        return response.payload;
      },
      onSuccess: (session) => {
        queryClient.invalidateQueries({
          queryKey: HUMAN_HANDOFF_QUERY_KEYS.adminNotifications,
        });
        queryClient.invalidateQueries({
          queryKey: HUMAN_HANDOFF_QUERY_KEYS.status(session.conversationId),
        });

        // Emit socket event to notify user
        const socketInstance = socketManager.connect();
        socketInstance.emit("human-support-accepted", {
          sessionId: session.id,
          conversationId: session.conversationId,
          adminId: session.adminId,
        });

        toast.success("Đã nhận cuộc hỗ trợ thành công");
      },
      onError: () => {
        toast.error("Không thể nhận cuộc hỗ trợ");
      },
    });
  },

  // End handoff session
  useEndHandoff: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (sessionId: string) => {
        const response = await http.post<HumanHandoffSession>(
          `human-handoff/end/${sessionId}`,
          {
            body: {},
          }
        );
        return response.payload;
      },
      onSuccess: (session) => {
        queryClient.invalidateQueries({
          queryKey: HUMAN_HANDOFF_QUERY_KEYS.status(session.conversationId),
        });

        // Emit socket event
        const socketInstance = socketManager.connect();
        socketInstance.emit("human-support-ended", {
          sessionId: session.id,
          conversationId: session.conversationId,
        });

        clearTimeoutHandler();
        toast.success("Đã kết thúc phiên hỗ trợ");
      },
      onError: () => {
        toast.error("Không thể kết thúc phiên hỗ trợ");
      },
    });
  },

  // Get all sessions (admin)
  useAdminSessions: () => {
    return useQueryCommon<HumanHandoffSession[]>({
      url: "human-handoff/admin/sessions",
      queryKey: HUMAN_HANDOFF_QUERY_KEYS.sessions,
    });
  },

  // Send user message in handoff session
  useSendUserMessage: () => {
    return useMutation({
      mutationFn: async ({
        conversationId,
        message,
        adminId,
      }: {
        conversationId: string;
        message: string;
        adminId?: number;
      }) => {
        // Send via socket for real-time
        socketManager.emit("send-user-message", {
          conversationId,
          message,
          adminId,
        });

        // Also send via API for persistence
        const response = await http.post(
          `human-handoff/conversation/${conversationId}/message`,
          {
            body: {
              message,
              senderType: "user",
            },
          }
        );
        return response.payload;
      },
      onError: () => {
        toast.error("Không thể gửi tin nhắn tới cán bộ tư vấn.");
      },
    });
  },

  // Send admin message in handoff session
  useSendAdminMessage: () => {
    return useMutation({
      mutationFn: async ({
        sessionId,
        conversationId,
        message,
        adminName,
      }: {
        sessionId: string;
        conversationId: string;
        message: string;
        adminName: string;
      }) => {
        // Send via socket for real-time
        socketManager.emit("send-admin-message", {
          conversationId,
          message,
          adminName,
        });

        // Also send via API for persistence
        const response = await http.post(`human-handoff/${sessionId}/message`, {
          body: {
            message,
            senderType: "admin",
            adminName,
          },
        });
        return response.payload;
      },
      onError: () => {
        toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");
      },
    });
  },

  // Socket Management Methods
  connectSocket: (conversationId?: string, adminId?: number) => {
    return socketManager.connect(conversationId, adminId);
  },

  disconnectSocket: () => {
    socketManager.disconnect();
  },

  setupSocketListeners: (callbacks: {
    onSupportAccepted?: (data: {
      sessionId: string;
      adminName: string;
      adminId: number;
    }) => void;
    onSupportEnded?: () => void;
    onHumanMessage?: (data: {
      message: string;
      adminName: string;
      timestamp: Date;
    }) => void;
    onUserMessage?: (data: {
      conversationId: string;
      message: string;
      timestamp: Date;
    }) => void;
    onAdminNotification?: (data: any) => void;
  }) => {
    // Clean up existing listeners
    socketManager.cleanup();

    // Set up new listeners
    if (callbacks.onSupportAccepted) {
      socketManager.on("human-support-accepted", callbacks.onSupportAccepted);
    }

    if (callbacks.onSupportEnded) {
      socketManager.on("human-support-ended", callbacks.onSupportEnded);
    }

    if (callbacks.onHumanMessage) {
      socketManager.on("human-message", callbacks.onHumanMessage);
    }

    if (callbacks.onUserMessage) {
      socketManager.on("user-message", callbacks.onUserMessage);
    }

    if (callbacks.onAdminNotification) {
      socketManager.on("admin-notification", callbacks.onAdminNotification);
    }

    // Return cleanup function
    return () => {
      socketManager.cleanup();
    };
  },

  // Helper: Start timeout with callbacks
  startTimeout,
  clearTimeout: clearTimeoutHandler,

  // Helper: Get current user
  getCurrentUser,

  // Helper: Create handoff request
  createHandoffRequest: (
    conversationId: string,
    message: string
  ): HumanHandoffRequest => {
    const user = getCurrentUser();
    const userProfile = getLocalStorage({ key: ENameLocalS.PROFILE }) as any;

    return {
      conversationId,
      message,
      ...user,
      userProfile: userProfile
        ? {
            name: userProfile.fullName || userProfile.firstName || "User",
            email: userProfile.email,
          }
        : undefined,
    };
  },

  // Server-side functions (for SSR/API routes)
  serverRequestHandoff: async (request: HumanHandoffRequest) => {
    return http.post<HumanHandoffSession>("human-handoff/request", {
      body: request,
    });
  },

  serverGetStatus: async (conversationId: string) => {
    return http.get<HumanHandoffStatus>(
      `human-handoff/status/${conversationId}`
    );
  },

  serverAcceptHandoff: async (sessionId: string) => {
    return http.post<HumanHandoffSession>(
      `human-handoff/admin/accept/${sessionId}`,
      { body: {} }
    );
  },

  serverEndHandoff: async (sessionId: string) => {
    return http.post<HumanHandoffSession>(`human-handoff/end/${sessionId}`, {
      body: {},
    });
  },

  serverGetAdminSessions: async () => {
    return http.get<HumanHandoffSession[]>("human-handoff/admin/sessions");
  },
};

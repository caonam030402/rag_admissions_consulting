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

// Socket instance
let socket: Socket | null = null;

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
    const guestId = getLocalStorage({ key: ENameLocalS.GUEST_ID }) as string;

    console.log("🔧 DEBUG - getCurrentUser:", { userId, guestId });

    return { userId, guestId };
};

const getSocket = (): Socket => {
    if (!socket) {
        socket = io(
            `${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"}/human-handoff`,
            {
                transports: ["websocket"],
                autoConnect: false,
            },
        );
    }
    return socket;
};

// Timeout handler
let timeoutHandler: NodeJS.Timeout | null = null;
const TIMEOUT_DURATION = 60000; // 60 seconds

const startTimeout = (
    conversationId: string,
    onTimeout: () => void,
    onUpdate: (timeRemaining: number) => void,
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
                    },
                );
                return response.payload;
            },
            onSuccess: (session) => {
                queryClient.invalidateQueries({
                    queryKey: HUMAN_HANDOFF_QUERY_KEYS.status(session.conversationId),
                });

                // Emit socket event to notify admins
                const socketInstance = getSocket();
                socketInstance.connect();
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
                    },
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
                const socketInstance = getSocket();
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
                    },
                );
                return response.payload;
            },
            onSuccess: (session) => {
                queryClient.invalidateQueries({
                    queryKey: HUMAN_HANDOFF_QUERY_KEYS.status(session.conversationId),
                });

                // Emit socket event
                const socketInstance = getSocket();
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

    // Socket event handlers - SIMPLE IMPLEMENTATION
    setupSocketListeners: (
        conversationId: string,
        callbacks: {
            onSupportAccepted?: (data: { sessionId: string; adminName: string }) => void;
            onSupportEnded?: () => void;
            onHumanMessage?: (data: { message: string; adminName: string }) => void;
        }
    ) => {
        console.log("🔧 DEBUG - setupSocketListeners params:", {
            conversationId,
            callbacks: callbacks || "undefined",
            callbackKeys: callbacks ? Object.keys(callbacks) : "no callbacks",
        });

        if (!conversationId) {
            console.error("🔧 ERROR - No conversationId provided");
            return () => { };
        }

        if (!callbacks) {
            console.error("🔧 ERROR - No callbacks provided");
            return () => { };
        }

        try {
            const socketInstance = getSocket();

            // Connect with conversationId in query
            socketInstance.io.opts.query = { conversationId };
            socketInstance.connect();

            console.log("🔧 DEBUG - Setting up individual listeners...");

            // Listen for admin acceptance
            if (callbacks.onSupportAccepted && typeof callbacks.onSupportAccepted === 'function') {
                console.log("🔧 DEBUG - Setting up onSupportAccepted listener");
                socketInstance.on("human-support-accepted", (data) => {
                    console.log("🔧 DEBUG - Received human-support-accepted event:", data);
                    callbacks.onSupportAccepted!(data);
                });
            }

            // Listen for session end
            if (callbacks.onSupportEnded && typeof callbacks.onSupportEnded === 'function') {
                console.log("🔧 DEBUG - Setting up onSupportEnded listener");
                socketInstance.on("human-support-ended", () => {
                    console.log("🔧 DEBUG - Received human-support-ended event");
                    callbacks.onSupportEnded!();
                });
            }

            // Listen for admin messages
            if (callbacks.onHumanMessage && typeof callbacks.onHumanMessage === 'function') {
                console.log("🔧 DEBUG - Setting up onHumanMessage listener");
                socketInstance.on("human-message", (data) => {
                    console.log("🔧 DEBUG - Received human-message event:", data);
                    callbacks.onHumanMessage!(data);
                });
            }

            console.log("🔧 DEBUG - Socket listeners setup complete");

            return () => {
                console.log("🔧 DEBUG - Cleaning up socket listeners");
                socketInstance.off("human-support-accepted");
                socketInstance.off("human-support-ended");
                socketInstance.off("human-message");
            };
        } catch (error) {
            console.error("🔧 ERROR - setupSocketListeners failed:", error);
            return () => { };
        }
    },

    // Helper: Start timeout with callbacks
    startTimeout,
    clearTimeout: clearTimeoutHandler,

    // Helper: Get current user
    getCurrentUser,

    // Helper: Create handoff request
    createHandoffRequest: (
        conversationId: string,
        message: string,
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

    // Send message in handoff session
    useSendMessage: () => {
        return useMutation({
            mutationFn: async ({
                sessionId,
                message,
                senderType = "admin",
                adminId,
                adminName,
            }: {
                sessionId: string;
                message: string;
                senderType?: "user" | "admin";
                adminId?: number;
                adminName?: string;
            }) => {
                const response = await http.post(`human-handoff/${sessionId}/message`, {
                    body: {
                        message,
                        senderType,
                        adminId,
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

    // Send user message in handoff session
    useSendUserMessage: () => {
        return useMutation({
            mutationFn: async ({
                conversationId,
                message,
            }: {
                conversationId: string;
                message: string;
            }) => {
                const response = await http.post(
                    `human-handoff/conversation/${conversationId}/message`,
                    {
                        body: {
                            message,
                            senderType: "user",
                        },
                    },
                );
                return response.payload;
            },
            onError: () => {
                toast.error("Không thể gửi tin nhắn tới cán bộ tư vấn.");
            },
        });
    },

    // Server-side functions (for SSR/API routes)
    serverRequestHandoff: async (request: HumanHandoffRequest) => {
        return http.post<HumanHandoffSession>("human-handoff/request", {
            body: request,
        });
    },

    serverGetStatus: async (conversationId: string) => {
        return http.get<HumanHandoffStatus>(
            `human-handoff/status/${conversationId}`,
        );
    },

    serverAcceptHandoff: async (sessionId: string) => {
        return http.post<HumanHandoffSession>(
            `human-handoff/admin/accept/${sessionId}`,
            { body: {} },
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

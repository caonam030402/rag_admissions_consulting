import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import { ENameLocalS } from "@/constants";
import { ActorType } from "@/enums/systemChat";
import { useQueryCommon } from "@/hooks/useQuery";
import type {
  ChatMessage,
  PaginatedConversations,
  PaginatedChatMessages,
} from "@/types/chat";
import { getLocalStorage } from "@/utils/clientStorage";
import http from "@/utils/http";

const RAG_API_URL = "http://localhost:8000/api/v1"; // Python RAG API

// Types for requests
interface CreateMessageRequest {
  userId?: number;
  guestId?: string;
  role: "user" | "assistant";
  content: string;
  conversationId?: string;
  title?: string;
}

interface UpdateConversationTitleRequest {
  conversationId: string;
  title: string;
}

interface ChatStreamRequest {
  message: string;
  user_email: string;
  conversation_id: string;
  user_id?: number;
}

// Query keys
export const CHAT_QUERY_KEYS = {
  conversations: ["conversations"] as const,
  conversationHistory: (id: string) =>
    ["conversations", id, "history"] as const,
};

// Helper functions - Define getGuestId first to avoid usage before definition
const getGuestId = (): string => {
  let guestId = localStorage.getItem("guestId");
  if (!guestId) {
    guestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("guestId", guestId);
  }
  return guestId;
};

const getCurrentUser = (): { userId?: number; guestId?: string } => {
  const userProfile = getLocalStorage({ key: ENameLocalS.PROFILE }) as any;

  if (userProfile && userProfile.id) {
    return { userId: userProfile.id };
  }

  return { guestId: getGuestId() };
};

const getCurrentConversationId = (): string => {
  let conversationId = localStorage.getItem("currentConversationId");
  if (!conversationId) {
    conversationId = uuidv4();
    localStorage.setItem("currentConversationId", conversationId);
  }
  return conversationId;
};

// Helper function to cleanup conversation data
const cleanupConversationData = (): void => {
  // Clear current conversation from localStorage
  localStorage.removeItem("currentConversationId");
};

// Helper function to ensure conversation ID sync
const ensureConversationSync = (conversationId: string): void => {
  const currentFromStorage = localStorage.getItem("currentConversationId");
  if (currentFromStorage !== conversationId) {
    localStorage.setItem("currentConversationId", conversationId);
  }
};

const setCurrentConversation = (conversationId: string): void => {
  localStorage.setItem("currentConversationId", conversationId);
  console.log("Switched to conversation:", conversationId);
};

const startNewConversation = (): string => {
  const conversationId = uuidv4();
  localStorage.setItem("currentConversationId", conversationId);
  console.log("Started new conversation:", conversationId);
  return conversationId;
};

// Stream message generator function
const streamMessage = async function* (
  content: string,
  conversationId?: string,
): AsyncGenerator<string> {
  try {
    const user = getCurrentUser();
    const currentConversationId = conversationId || getCurrentConversationId();

    // Prepare request data based on user type
    let requestData: ChatStreamRequest;

    // Add user identification based on login status
    if (user.userId) {
      // Registered user - send userId and email
      const userEmail = localStorage.getItem(ENameLocalS.EMAIL);
      requestData = {
        message: content,
        conversation_id: currentConversationId,
        user_email: userEmail || `user-${user.userId}@example.com`,
        user_id: user.userId,
      };
    } else {
      // Guest user - send guestId directly as user_email
      requestData = {
        message: content,
        conversation_id: currentConversationId,
        user_email: user.guestId!, // Send guest ID directly, no @example.com
      };
    }

    console.log("🔧 DEBUG: Sending request to Python service:", requestData);

    const response = await fetch(`${RAG_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is null");

    const decoder = new TextDecoder();

    // Disable await-in-loop warning for streaming
    // eslint-disable-next-line no-await-in-loop
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      console.log("🔧 DEBUG Raw chunk:", chunk);

      const lines = chunk.split("\n").filter((line) => line.trim());
      console.log("🔧 DEBUG Parsed lines:", lines);

      for (const line of lines) {
        try {
          console.log("🔧 DEBUG Processing line:", line);
          const parsed = JSON.parse(line);
          console.log("🔧 DEBUG Parsed JSON:", parsed);

          const { delta } = parsed;
          if (delta) {
            console.log("🔧 DEBUG Yielding delta:", delta);
            yield delta;
          } else {
            console.log("🔧 DEBUG No delta in response:", parsed);
          }
        } catch (e) {
          console.error(
            "🔧 DEBUG Error parsing SSE message:",
            e,
            "Line:",
            line,
          );
        }
      }
    }
  } catch (error) {
    console.error("Stream error:", error);
    throw error;
  }
};

// Chat service following auth service pattern
export const chatService = {
  // React Query hooks for conversations
  useConversations: (page: number = 1, limit: number = 50) => {
    const user = getCurrentUser();

    return useQueryCommon<PaginatedConversations>({
      queryKey: [
        ...CHAT_QUERY_KEYS.conversations,
        user.userId ? `user-${user.userId}` : `guest-${user.guestId}`,
        page,
        limit,
      ],
      url: "chatbots/conversations", // Use relative URL
      queryFn: async () => {
        const params = new URLSearchParams();
        if (user.userId) {
          params.append("userId", user.userId.toString());
        } else if (user.guestId) {
          params.append("guestId", user.guestId);
        }
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        const response = await http.get<{
          data: any[];
          hasNextPage: boolean;
        }>(`chatbots/conversations?${params}`);

        return {
          data: response.payload.data.map((conv: any) => ({
            ...conv,
            lastMessageTime: new Date(conv.lastMessageTime),
          })),
          hasNextPage: response.payload.hasNextPage,
        };
      },
      enabled: !!(user.userId || user.guestId),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes cache
      retry: 2,
      refetchOnMount: false, // Không refetch khi component mount
      refetchOnWindowFocus: false, // Không refetch khi focus window
      refetchOnReconnect: true, // Chỉ refetch khi reconnect network
    });
  },

  // Hook to get conversation history
  useConversationHistory: (
    conversationId: string | null,
    page: number = 1,
    limit: number = 50,
  ) => {
    return useQueryCommon<PaginatedChatMessages>({
      queryKey: conversationId
        ? [...CHAT_QUERY_KEYS.conversationHistory(conversationId), page, limit]
        : [],
      url: `chatbots/conversations/${conversationId}/history`, // Use relative URL
      queryFn: async () => {
        if (!conversationId) {
          return { data: [], hasNextPage: false };
        }

        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        const response = await http.get<{
          data: any[];
          hasNextPage: boolean;
        }>(`chatbots/conversations/${conversationId}/history?${params}`);

        return {
          data: response.payload.data.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role === "user" ? ActorType.Human : ActorType.Bot,
            timestamp: new Date(msg.createdAt).getTime(),
            conversationId: msg.conversationId,
          })),
          hasNextPage: response.payload.hasNextPage,
        };
      },
      enabled: !!conversationId,
      staleTime: 1000 * 60 * 10, // 10 minutes - Tăng thời gian cache
      gcTime: 1000 * 60 * 30, // 30 minutes - Cache lâu hơn (React Query v5)
      retry: 1,
      refetchOnMount: false, // Không refetch khi component mount
      refetchOnWindowFocus: false, // Không refetch khi focus window
      refetchOnReconnect: true, // Chỉ refetch khi reconnect network
    });
  },

  // Mutation to save message
  useSaveMessage: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (message: ChatMessage) => {
        const user = getCurrentUser();
        const requestData: CreateMessageRequest = {
          ...user,
          role: message.role === ActorType.Human ? "user" : "assistant",
          content: message.content,
          conversationId: message.conversationId,
        };

        const response = await http.post("chatbots/history", {
          body: requestData,
        });
        return response.payload;
      },
      onSuccess: (_, message) => {
        // Invalidate conversations list to refresh lastMessage and timestamp
        queryClient.invalidateQueries({
          queryKey: CHAT_QUERY_KEYS.conversations,
        });

        // Optionally update conversation history cache if it exists
        if (message.conversationId) {
          queryClient.setQueriesData<PaginatedChatMessages>(
            {
              queryKey: CHAT_QUERY_KEYS.conversationHistory(
                message.conversationId,
              ),
            },
            (oldData) => {
              if (!oldData) return oldData;

              // Check if message already exists
              const exists = oldData.data.some((msg) => msg.id === message.id);
              if (exists) return oldData;

              return {
                ...oldData,
                data: [...oldData.data, message],
              };
            },
          );
        }
      },
      onError: (error) => {
        console.error("Error saving message:", error);
        // Don't show toast for save errors as it might be too noisy
      },
    });
  },

  // Mutation to update conversation title
  useUpdateConversationTitle: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({
        conversationId,
        title,
      }: UpdateConversationTitleRequest) => {
        const response = await http.put(
          `chatbots/conversations/${conversationId}/title`,
          {
            body: { title },
          },
        );
        return response.payload;
      },
      onSuccess: (_, { conversationId, title }) => {
        // Update conversations cache
        queryClient.setQueriesData<PaginatedConversations>(
          { queryKey: CHAT_QUERY_KEYS.conversations },
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              data: oldData.data.map((conv) =>
                conv.conversationId === conversationId
                  ? { ...conv, title }
                  : conv,
              ),
            };
          },
        );

        toast.success("Đã cập nhật tiêu đề cuộc trò chuyện");
      },
      onError: (error) => {
        console.error("Error updating conversation title:", error);
        toast.error("Không thể cập nhật tiêu đề cuộc trò chuyện");
      },
    });
  },

  // Mutation to delete conversation
  useDeleteConversation: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (conversationId: string) => {
        const response = await http.delete(
          `chatbots/conversations/${conversationId}`,
          {
            body: {},
          },
        );
        return response.payload;
      },
      onSuccess: (_, conversationId) => {
        // Remove from conversations cache
        queryClient.setQueriesData<PaginatedConversations>(
          { queryKey: CHAT_QUERY_KEYS.conversations },
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              data: oldData.data.filter(
                (conv) => conv.conversationId !== conversationId,
              ),
            };
          },
        );

        // Remove conversation history cache
        queryClient.removeQueries({
          queryKey: CHAT_QUERY_KEYS.conversationHistory(conversationId),
        });

        // Clear local storage if this was the current conversation
        const currentConversationId = localStorage.getItem(
          "currentConversationId",
        );
        if (currentConversationId === conversationId) {
          localStorage.removeItem("currentConversationId");
        }

        toast.success("Đã xóa cuộc trò chuyện");
      },
      onError: (error) => {
        console.error("Error deleting conversation:", error);
        toast.error("Không thể xóa cuộc trò chuyện");
      },
    });
  },

  // Hook to prefetch conversation history
  usePrefetchConversationHistory: () => {
    const queryClient = useQueryClient();

    return (conversationId: string) => {
      queryClient.prefetchQuery({
        queryKey: CHAT_QUERY_KEYS.conversationHistory(conversationId),
        queryFn: async () => {
          const params = new URLSearchParams();
          params.append("page", "1");
          params.append("limit", "50");

          const response = await http.get<{
            data: any[];
            hasNextPage: boolean;
          }>(`chatbots/conversations/${conversationId}/history?${params}`);

          return {
            data: response.payload.data.map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              role: msg.role === "user" ? ActorType.Human : ActorType.Bot,
              timestamp: new Date(msg.createdAt).getTime(),
              conversationId: msg.conversationId,
            })),
            hasNextPage: response.payload.hasNextPage,
          };
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
      });
    };
  },

  // Hook to manually refresh conversations and history
  useRefreshChatData: () => {
    const queryClient = useQueryClient();

    return {
      refreshConversations: () => {
        queryClient.invalidateQueries({
          queryKey: CHAT_QUERY_KEYS.conversations,
        });
      },
      refreshConversationHistory: (conversationId: string) => {
        queryClient.invalidateQueries({
          queryKey: CHAT_QUERY_KEYS.conversationHistory(conversationId),
        });
      },
      refreshAllChatData: () => {
        queryClient.invalidateQueries({
          queryKey: CHAT_QUERY_KEYS.conversations,
        });
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "conversations" &&
            query.queryKey[2] === "history",
        });
      },
    };
  },

  // Server-side functions (non-React Query)
  getCurrentUser,
  getGuestId,
  getCurrentConversationId,
  setCurrentConversation,
  startNewConversation,
  streamMessage,
  cleanupConversationData,
  ensureConversationSync,

  // Server-side sendMessage
  sendMessage: async (
    content: string,
    conversationId?: string,
  ): Promise<ChatMessage> => {
    try {
      const userEmail =
        localStorage.getItem(ENameLocalS.EMAIL) ||
        `guest-${getGuestId()}@example.com`;
      const currentConversationId =
        conversationId || getCurrentConversationId();

      const requestData: ChatStreamRequest = {
        message: content,
        user_email: userEmail,
        conversation_id: currentConversationId,
      };

      const response = await fetch(`${RAG_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id || Date.now().toString(),
        content: data.content,
        role: ActorType.Bot,
        timestamp: Date.now(),
        conversationId: currentConversationId,
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
};

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useQueryCommon } from "@/hooks/useQuery";
import { chatService } from "@/services/chat";
import type {
  Conversation,
  ChatMessage,
  PaginatedConversations,
  PaginatedChatMessages,
} from "@/types/chat";

// Query keys
export const CHAT_QUERY_KEYS = {
  conversations: ["conversations"] as const,
  conversationHistory: (id: string) =>
    ["conversations", id, "history"] as const,
};

// Hook to get conversations list
export function useConversations(page: number = 1, limit: number = 50) {
  const user = chatService.getCurrentUser();

  return useQueryCommon<PaginatedConversations>({
    queryKey: [
      ...CHAT_QUERY_KEYS.conversations,
      user.userId ? `user-${user.userId}` : `guest-${user.guestId}`,
      page,
      limit,
    ],
    url: "", // Not used since we override queryFn
    queryFn: () => chatService.getConversations(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

// Hook to get conversation history
export function useConversationHistory(
  conversationId: string | null,
  page: number = 1,
  limit: number = 50
) {
  return useQueryCommon<PaginatedChatMessages>({
    queryKey: conversationId
      ? [...CHAT_QUERY_KEYS.conversationHistory(conversationId), page, limit]
      : [],
    url: "", // Not used since we override queryFn
    queryFn: () =>
      conversationId
        ? chatService.getConversationHistory(conversationId, page, limit)
        : Promise.resolve({ data: [], hasNextPage: false }),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
}

// Mutation to update conversation title
export function useUpdateConversationTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      title,
    }: {
      conversationId: string;
      title: string;
    }) => chatService.updateConversationTitle(conversationId, title),
    onSuccess: (_, { conversationId, title }) => {
      // Update conversations cache
      queryClient.setQueriesData<PaginatedConversations>(
        { queryKey: CHAT_QUERY_KEYS.conversations },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((conv) =>
              conv.conversationId === conversationId ? { ...conv, title } : conv
            ),
          };
        }
      );
    },
    onError: (error) => {
      console.error("Error updating conversation title:", error);
    },
  });
}

// Mutation to save message
export function useSaveMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: ChatMessage) => chatService.saveMessage(message),
    onSuccess: () => {
      // Invalidate conversations list to refresh
      queryClient.invalidateQueries({
        queryKey: CHAT_QUERY_KEYS.conversations,
      });
    },
    onError: (error) => {
      console.error("Error saving message:", error);
    },
  });
}

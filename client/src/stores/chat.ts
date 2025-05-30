import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

import { ActorType } from "@/enums/systemChat";
import type { ChatMessage, ChatState } from "@/types/chat";

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  conversations: [], // This will be removed as React Query handles it
  currentConversationId: null,
  isTyping: false,
  error: null,
  guestId: null,
  userId: null,

  // Initialize user info
  setGuestId: (guestId: string) => set({ guestId }),
  setUserId: (userId: number) => set({ userId }),

  // Message actions
  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  appendToLastMessage: (content: string) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === ActorType.Bot) {
        lastMessage.content += content;
        return { messages };
      }
      return state;
    }),

  startNewAssistantMessage: () => {
    const { currentConversationId } = get();
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: uuidv4(),
          content: "",
          role: ActorType.Bot,
          timestamp: Date.now(),
          conversationId: currentConversationId || undefined,
        },
      ],
    }));
  },

  setTyping: (isTyping: boolean) => set({ isTyping }),
  setError: (error: string | null) => set({ error }),

  clearMessages: () =>
    set({
      messages: [],
      error: null,
    }),

  // Simplified conversation actions - React Query handles data fetching
  loadConversations: async () => {
    // This is now handled by React Query useConversations hook
    console.warn(
      "loadConversations is deprecated, use useConversations hook instead"
    );
  },

  startNewConversation: () => {
    const newConversationId = uuidv4();
    set({
      currentConversationId: newConversationId,
      messages: [],
      error: null,
    });
  },

  loadConversation: async (conversationId: string) => {
    // This is now handled by React Query useConversationHistory hook
    set({
      currentConversationId: conversationId,
      messages: [], // Will be populated by React Query hook
      error: null,
    });
  },

  updateConversationTitle: async (conversationId: string, title: string) => {
    // This is now handled by React Query useUpdateConversationTitle hook
    console.warn(
      "updateConversationTitle is deprecated, use useUpdateConversationTitle hook instead"
    );
  },
}));

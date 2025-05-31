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
    set((state) => {
      console.log("🔧 DEBUG addMessage:", {
        messageId: message.id,
        messageRole: message.role,
        messageConversationId: message.conversationId,
        currentConversationId: state.currentConversationId,
        currentMessagesCount: state.messages.length,
      });

      // Add all messages regardless of conversation ID for now
      console.log("✅ DEBUG: Adding message to store");
      return {
        messages: [...state.messages, message],
      };
    });
  },

  appendToLastMessage: (content: string) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMessage = messages[messages.length - 1];

      console.log("🔧 DEBUG appendToLastMessage:", {
        content: content.slice(0, 20),
        hasLastMessage: !!lastMessage,
        lastMessageRole: lastMessage?.role,
        messagesCount: messages.length,
      });

      if (lastMessage && lastMessage.role === ActorType.Bot) {
        lastMessage.content += content;
        console.log("✅ DEBUG: Content appended, new length:", lastMessage.content.length);
        return { messages };
      }

      console.log("❌ DEBUG: Cannot append - no bot message");
      return state;
    }),

  startNewAssistantMessage: () => {
    const { currentConversationId } = get();

    console.log("🔧 DEBUG startNewAssistantMessage:", {
      currentConversationId,
      currentMessagesCount: get().messages.length,
    });

    set((state) => {
      const newMessage = {
        id: uuidv4(),
        content: "",
        role: ActorType.Bot,
        timestamp: Date.now(),
        conversationId: currentConversationId || undefined,
      };

      console.log("✅ DEBUG: Creating new assistant message:", newMessage);

      return {
        messages: [...state.messages, newMessage],
      };
    });
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
      "loadConversations is deprecated, use useConversations hook instead",
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

  // Replace messages for a specific conversation (used when loading history)
  replaceMessages: (conversationId: string, messages: ChatMessage[]) => {
    set((state) => {
      // Only replace if it's the current conversation
      if (state.currentConversationId === conversationId) {
        return {
          messages: messages.filter(
            (msg) => msg.conversationId === conversationId,
          ),
        };
      }
      return state;
    });
  },

  updateConversationTitle: async (_conversationId: string, _title: string) => {
    // This is now handled by React Query useUpdateConversationTitle hook
    console.warn(
      "updateConversationTitle is deprecated, use useUpdateConversationTitle hook instead",
    );
  },
}));

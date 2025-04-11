import { create } from "zustand";
import { ChatMessage, ChatState } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isTyping: false,
  error: null,

  addMessage: (message: ChatMessage) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  appendToLastMessage: (content: string) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        lastMessage.content += content;
        return { messages };
      }
      return state;
    }),

  startNewAssistantMessage: () =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: uuidv4(),
          content: "",
          role: "assistant",
          timestamp: Date.now(),
        },
      ],
    })),

  setTyping: (isTyping: boolean) =>
    set({
      isTyping,
    }),

  setError: (error: string | null) =>
    set({
      error,
    }),

  clearMessages: () =>
    set({
      messages: [],
      error: null,
    }),
}));

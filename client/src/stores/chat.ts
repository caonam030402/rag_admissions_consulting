import { create } from "zustand";
import { ChatMessage, ChatState } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";
import { ActorType } from "@/enums/systemChat";

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
      if (lastMessage && lastMessage.role === ActorType.Bot) {
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
          role: ActorType.Bot,
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

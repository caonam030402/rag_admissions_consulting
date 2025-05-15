import type { ActorType } from "@/enums/systemChat";

export interface ChatMessage {
  id: string;
  content: string;
  role: ActorType;
  timestamp: number;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
  addMessage: (message: ChatMessage) => void;
  setTyping: (isTyping: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  startNewAssistantMessage: () => void;
  appendToLastMessage: (content: string) => void;
}

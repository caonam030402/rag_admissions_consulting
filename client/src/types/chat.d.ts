import type { Dispatch, SetStateAction } from "react";

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

export interface IEmailFormData {
  email: string;
  agreed: boolean;
}

export type TabTypeChatbotWidget = "home" | "chat";

export interface IChatbotWidgetProps {
  onTabChange: (tab: TabTypeChatbotWidget) => void;
}

export interface IMainChatProps {
  checkEmailHasSaved: () => boolean;
  handleTabSwitch: (tab: TabTypeChatbotWidget) => void;
}

export interface IEmailFormProps {
  showEmailForm: boolean;
  setShowEmailForm: Dispatch<SetStateAction<boolean>>;
}

import type { Dispatch, SetStateAction } from "react";

import type { ActorType } from "@/enums/systemChat";

export interface ChatMessage {
  id: string;
  content: string;
  role: ActorType;
  timestamp: number;
  conversationId?: string;
}

export interface Conversation {
  conversationId: string;
  title: string | null;
  lastMessage: string;
  lastMessageTime: Date;
  messageCount: number;
}

// Pagination response types
export interface PaginatedConversations {
  data: Conversation[];
  hasNextPage: boolean;
}

export interface PaginatedChatMessages {
  data: ChatMessage[];
  hasNextPage: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  conversations: Conversation[];
  currentConversationId: string | null;
  isTyping: boolean;
  error: string | null;
  guestId: string | null;
  userId: number | null;

  // Message actions
  addMessage: (message: ChatMessage) => void;
  setTyping: (isTyping: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  startNewAssistantMessage: () => void;
  appendToLastMessage: (content: string) => void;
  replaceMessages: (conversationId: string, messages: ChatMessage[]) => void;

  // Conversation actions
  loadConversations: () => Promise<void>;
  startNewConversation: () => void;
  loadConversation: (conversationId: string) => void;
  updateConversationTitle: (
    _conversationId: string,
    _title: string,
  ) => Promise<void>;

  // User actions
  setGuestId: (guestId: string) => void;
  setUserId: (userId: number) => void;
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

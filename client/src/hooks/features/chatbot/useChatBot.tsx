import { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { ActorType } from "@/enums/systemChat";
import { chatService } from "@/services/chat";
import { useChatStore } from "@/stores/chat";
import { useSaveMessage } from "./useChatHistory";

export default function useChatBot() {
  const [message, setMessage] = useState("");
  const {
    addMessage,
    setTyping,
    setError,
    isTyping,
    currentConversationId,
    setGuestId,
    setUserId,
  } = useChatStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // React Query mutation for saving messages
  const saveMessageMutation = useSaveMessage();

  // Initialize user info on mount
  useEffect(() => {
    const userInfo = chatService.getCurrentUser();
    if (userInfo.userId) {
      setUserId(userInfo.userId);
    } else if (userInfo.guestId) {
      setGuestId(userInfo.guestId);
    }
  }, [setUserId, setGuestId]);

  const sendMessage = async ({
    callback,
    newMessage,
    role,
  }: {
    callback?: () => void;
    newMessage?: string;
    role?: ActorType;
  }) => {
    const messageTrim = newMessage || message;

    if (!messageTrim.trim() || isTyping) return;
    callback?.();
    const trimmedMessage = messageTrim.trim();
    setMessage("");

    // Get or create conversation ID
    const conversationId =
      currentConversationId || chatService.getCurrentConversationId();

    // Add user message
    const userMessage = {
      id: uuidv4(),
      content: trimmedMessage,
      role: role || ActorType.Human,
      timestamp: Date.now(),
      conversationId: conversationId,
    };

    addMessage(userMessage);

    // Save user message using React Query
    saveMessageMutation.mutate(userMessage);

    setTyping(true);

    try {
      useChatStore.getState().startNewAssistantMessage();

      for await (const token of chatService.streamMessage(
        trimmedMessage,
        conversationId
      )) {
        useChatStore.getState().appendToLastMessage(token);
      }

      // Save assistant message when streaming is complete using React Query
      const assistantMessage =
        useChatStore.getState().messages[
          useChatStore.getState().messages.length - 1
        ];
      if (assistantMessage && assistantMessage.role === ActorType.Bot) {
        // Ensure assistant message has conversation ID
        assistantMessage.conversationId = conversationId;
        saveMessageMutation.mutate(assistantMessage);
      }

      inputRef.current?.focus();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setTyping(false);
      inputRef.current?.focus();
    }
  };

  // Function to start new conversation
  const startNewConversation = () => {
    const newConversationId = chatService.startNewConversation();
    useChatStore.getState().startNewConversation();
    return newConversationId;
  };

  // Function to switch to existing conversation
  const switchToConversation = (conversationId: string) => {
    chatService.setCurrentConversation(conversationId);
    useChatStore.getState().loadConversation(conversationId);
  };

  return {
    sendMessage,
    message,
    setMessage,
    isTyping,
    inputRef,
    saveMessageMutation,
    startNewConversation,
    switchToConversation,
    currentConversationId:
      currentConversationId || chatService.getCurrentConversationId(),
  };
}

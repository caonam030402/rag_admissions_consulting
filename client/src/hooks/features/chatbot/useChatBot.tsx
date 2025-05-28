import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { ActorType } from "@/enums/systemChat";
import { chatService } from "@/services/chat";
import { useChatStore } from "@/stores/chat";

export default function useChatBot() {
  const [message, setMessage] = useState("");
  const { addMessage, setTyping, setError, isTyping } = useChatStore();
  const inputRef = useRef<HTMLInputElement>(null);

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

    addMessage({
      id: uuidv4(),
      content: trimmedMessage,
      role: role || ActorType.Human,
      timestamp: Date.now(),
    });

    setTyping(true);

    try {
      useChatStore.getState().startNewAssistantMessage();

      for await (const token of chatService.streamMessage(trimmedMessage)) {
        useChatStore.getState().appendToLastMessage(token);
      }
      inputRef.current?.focus();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send message",
      );
    } finally {
      setTyping(false);
      inputRef.current?.focus();
    }
  };

  return { sendMessage, message, setMessage, isTyping, inputRef };
}

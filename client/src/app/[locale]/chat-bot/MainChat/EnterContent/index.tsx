"use client";

import {
  ArrowsOutSimple,
  Eraser,
  Image,
  Microphone,
  PaperPlaneRight,
} from "@phosphor-icons/react";
import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import Button from "@/components/common/Button";
import { ActorType } from "@/enums/systemChat";
import { chatService } from "@/services/chat";
import { useChatStore } from "@/stores/chat";

const UtilityButtons = [
  {
    icon: <Image size={20} weight="bold" />,
    label: "Upload image",
    action: () => {
      console.log("Image upload not implemented");
    },
  },
  {
    icon: <Microphone size={20} weight="bold" />,
    label: "Voice input",
    action: () => {
      console.log("Voice input not implemented");
    },
  },
];

const ActionButtons = [
  {
    icon: <Eraser size={20} weight="bold" />,
    label: "Clear chat",
    action: () => {
      useChatStore.getState().clearMessages();
    },
  },
  {
    icon: <ArrowsOutSimple size={20} weight="bold" />,
    label: "Expand chat",
    action: () => {
      console.log("Expand chat not implemented");
    },
  },
];

export default function EnterContent() {
  const [message, setMessage] = useState("");
  const { addMessage, setTyping, setError, isTyping } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max height of 120px
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleSubmit = async () => {
    if (!message.trim() || isTyping) return;

    const trimmedMessage = message.trim();
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Add user message to chat
    addMessage({
      id: uuidv4(),
      content: trimmedMessage,
      role: ActorType.Human,
      timestamp: Date.now(),
    });

    setTyping(true);

    try {
      // Start a new empty assistant message
      useChatStore.getState().startNewAssistantMessage();

      // Stream the response
      for await (const token of chatService.streamMessage(trimmedMessage)) {
        useChatStore.getState().appendToLastMessage(token);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send message",
      );
    } finally {
      setTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 bg-white shadow-lg rounded-xl">
      <div className="relative flex items-center gap-2 rounded-xl border border-default-200 bg-default-50 px-3 py-2 transition-all hover:border-blue-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200">
        <div className="flex items-center gap-2">
          {UtilityButtons.map((item, index) => (
            <Button
              key={index}
              variant="light"
              size="sm"
              isIconOnly
              className="text-blue-500 hover:bg-blue-100 hover:text-blue-700"
              startContent={item.icon}
              aria-label={item.label}
              onClick={item.action}
            />
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-default-500 min-h-[24px] max-h-[120px]"
          placeholder="Send a message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            adjustTextareaHeight();
          }}
          onKeyDown={handleKeyPress}
          rows={1}
          disabled={isTyping}
        />
        <div className="flex items-center gap-2">
          {ActionButtons.map((item, index) => (
            <Button
              key={index}
              isIconOnly
              variant="light"
              size="sm"
              className="text-blue-500 hover:bg-blue-100 hover:text-blue-700"
              startContent={item.icon}
              aria-label={item.label}
              onClick={item.action}
            />
          ))}
          <Button
            size="sm"
            color="primary"
            isIconOnly
            onClick={handleSubmit}
            isDisabled={!message.trim() || isTyping}
            className={`${!message.trim() || isTyping ? "opacity-60" : "hover:scale-105"} transition-all`}
          >
            <PaperPlaneRight size={20} weight="fill" />
          </Button>
        </div>
      </div>
    </div>
  );
}

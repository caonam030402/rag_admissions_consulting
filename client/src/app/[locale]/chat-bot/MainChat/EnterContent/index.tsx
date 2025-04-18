"use client";

import {
  ArrowsOutSimple,
  Eraser,
  Image,
  Microphone,
  PaperPlaneRight,
} from "@phosphor-icons/react";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import Button from "@/components/common/Button";
import { chatService } from "@/services/chat";
import { useChatStore } from "@/stores/chat";

const listUtil = [
  {
    icon: <Image size={20} />,
    action: () => {
      // TODO: Implement image upload
      console.log("Image upload not implemented");
    },
  },
  {
    icon: <Microphone size={20} />,
    action: () => {
      // TODO: Implement voice input
      console.log("Voice input not implemented");
    },
  },
];

const listAction = [
  {
    icon: <Eraser size={20} />,
    action: () => {
      useChatStore.getState().clearMessages();
    },
  },
  {
    icon: <ArrowsOutSimple size={20} />,
    action: () => {
      // TODO: Implement expand chat
      console.log("Expand chat not implemented");
    },
  },
];

export default function EnterContent() {
  const [message, setMessage] = useState("");
  const { addMessage, setTyping, setError } = useChatStore();

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setMessage("");

    // Add user message to chat
    addMessage({
      id: uuidv4(),
      content: message.trim(),
      role: "user",
      timestamp: Date.now(),
    });

    setTyping(true);

    try {
      // Start a new empty assistant message
      useChatStore.getState().startNewAssistantMessage();

      // Stream the response
      for await (const token of chatService.streamMessage(message.trim())) {
        useChatStore.getState().appendToLastMessage(token);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send message"
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
    <div className="p-3">
      <div className="relative flex items-center gap-2 rounded-xl border border-default-200 bg-default-50 px-3 py-2">
        {listUtil.map((item, index) => (
          <Button
            key={index}
            variant="light"
            size="sm"
            isIconOnly
            className="text-default-500 hover:text-default-900"
            startContent={item.icon}
            onClick={item.action}
          />
        ))}
        <textarea
          className="flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-default-500"
          placeholder="Send a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
        />
        <div className="flex items-center gap-2">
          {listAction.map((item, index) => (
            <Button
              key={index}
              isIconOnly
              variant="light"
              size="sm"
              className="text-default-500 hover:text-default-900"
              startContent={item.icon}
              onClick={item.action}
            />
          ))}
          <Button size="sm" color="primary" isIconOnly onClick={handleSubmit}>
            <PaperPlaneRight size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}

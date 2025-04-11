"use client";

import {
  ArrowsOutSimple,
  Eraser,
  Image,
  Microphone,
  PaperPlaneRight,
} from "@phosphor-icons/react";
import React, { useState } from "react";

import Button from "@/components/common/Button";
import { useChatStore } from "@/stores/chat";
import { chatService } from "@/services/chat";
import { v4 as uuidv4 } from "uuid";

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
    <div className="border-t p-5">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {listUtil.map((item, index) => {
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                startContent={item.icon}
                onClick={item.action}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {listAction.map((item, index) => {
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                startContent={item.icon}
                onClick={item.action}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex gap-3">
        <textarea
          className="h-[45px] flex-1 resize-none rounded-lg border p-3 outline-none"
          placeholder="Send a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          startContent={<PaperPlaneRight size={20} />}
          onClick={handleSubmit}
          disabled={!message.trim()}
        />
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useChatStore } from "@/stores/chat";
import ChatMessage from "../ChatMessage";
import IntroChat from "../IntroChat";

export default function BodyMainChat() {
  const { messages, isTyping } = useChatStore();

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <IntroChat />
      ) : (
        <div className="flex flex-col">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && (
            <div className="flex gap-2 p-4">
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

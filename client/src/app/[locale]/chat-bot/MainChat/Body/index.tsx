"use client";

import React, { useEffect, useRef } from "react";

import { useChatStore } from "@/stores/chat";

import ChatMessage from "../ChatMessage";
import IntroChat from "../IntroChat";

export default function BodyMainChat() {
  const { messages, isTyping } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or when typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="h-[80vh] scroll px-2 pb-20 pt-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <IntroChat />
          <div className="mt-4 text-center text-gray-500 text-sm">
            Sử dụng các tính năng ở thanh bên để được hỗ trợ tốt hơn
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && (
            <div className="flex gap-2 p-4 items-center">
              <div className="size-2 animate-bounce rounded-full bg-blue-400" />
              <div className="size-2 animate-bounce rounded-full bg-blue-500 delay-100" />
              <div className="size-2 animate-bounce rounded-full bg-blue-600 delay-200" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

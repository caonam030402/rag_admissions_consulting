"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { User, Robot } from "@phosphor-icons/react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-4 p-4 ${isUser ? "bg-gray-50" : "bg-white"}`}>
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isUser ? "bg-blue-500" : "bg-green-500"}`}
      >
        {isUser ? (
          <User size={20} color="white" weight="fill" />
        ) : (
          <Robot size={20} color="white" weight="fill" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium">
          {isUser ? "You" : "Assistant"}
        </div>
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
      </div>
    </div>
  );
}

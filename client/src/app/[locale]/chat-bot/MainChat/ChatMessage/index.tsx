"use client";

import { Robot, User } from "@phosphor-icons/react";
import React from "react";

import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { ActorType } from "@/enums/systemChat";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === ActorType.Human;

  return (
    <div
      className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} items-start gap-2 px-4 py-3`}
    >
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-blue-500" : "bg-purple-500"}`}
      >
        {isUser ? (
          <User size={18} color="white" weight="fill" />
        ) : (
          <Robot size={18} color="white" weight="fill" />
        )}
      </div>
      <div
        className={`flex max-w-[80%] flex-col gap-1 rounded-2xl px-4 py-2 ${isUser ? "bg-blue-500 text-white" : "bg-gray-100"}`}
      >
        <div className="text-xs font-medium">
          {isUser ? "You" : "Assistant"}
        </div>
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
      </div>
    </div>
  );
}

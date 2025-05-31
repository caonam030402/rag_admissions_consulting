"use client";

import { Robot, User } from "@phosphor-icons/react";
import React from "react";

import { ActorType } from "@/enums/systemChat";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

// Simple markdown renderer function
const renderMarkdown = (text: string) =>
  text
    // Bold text **text** -> <strong>text</strong>
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold text-gray-800">$1</strong>',
    )
    // Line breaks
    .replace(/\n/g, "<br />")
    // Bullet points starting with * at beginning of line
    .replace(/^\* (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Wrap consecutive <li> elements in <ul>
    .replace(/(<li.*?<\/li>\s*)+/g, '<ul class="mb-2 space-y-1">$&</ul>');

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
        <div className="text-sm">
          {isUser ? (
            // User messages - plain text with whitespace preservation
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            // Assistant messages - render markdown
            <div
              className="leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(message.content),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

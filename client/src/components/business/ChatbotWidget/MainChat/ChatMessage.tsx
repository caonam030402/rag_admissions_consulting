"use client";

import { Robot } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import IsTyping from "@/components/common/IsTyping";
import { ActorType } from "@/enums/systemChat";
import { useChatStore } from "@/stores/chat";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
  isLastMessage: boolean;
}

// Lightweight markdown components for widget
const markdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-lg font-bold mb-2">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-base font-semibold mb-2">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-sm font-semibold mb-1">{children}</h3>
  ),
  p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }: any) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: any) => <em className="italic">{children}</em>,
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }: any) => <li className="text-sm">{children}</li>,
  code: ({ children }: any) => (
    <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-gray-300 pl-2 italic my-2">
      {children}
    </blockquote>
  ),
};

export default function ChatMessage({
  message,
  isLastMessage,
}: ChatMessageProps) {
  const isUser = message.role === ActorType.Human;
  const { isTyping } = useChatStore();

  return (
    <div
      className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} items-start gap-2 px-4 py-3`}
    >
      {!isUser && (
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-blue-500" : "bg-purple-500"}`}
        >
          <Robot size={18} color="white" weight="fill" />
        </div>
      )}
      <div
        className={`flex max-w-[80%] flex-col gap-1 rounded-2xl px-4 py-2 ${isUser ? "bg-blue-500 text-white" : "bg-gray-100"}`}
      >
        <div className="text-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isTyping && isLastMessage ? (
              <IsTyping />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

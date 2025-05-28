"use client";

import { Robot } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import React from "react";

import IsTyping from "@/components/common/IsTyping";
import { ActorType } from "@/enums/systemChat";
import { useChatStore } from "@/stores/chat";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
  isLastMessage: boolean;
}

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
        <div className="whitespace-pre-wrap text-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isTyping && isLastMessage && <IsTyping />}
            {message.content}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

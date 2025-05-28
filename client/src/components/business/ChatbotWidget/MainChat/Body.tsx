import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";

import { useChatStore } from "@/stores/chat";

import ChatMessage from "./ChatMessage";

export default function Body() {
  const { messages, isTyping } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div>
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;
        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ChatMessage
              key={message.id}
              message={message}
              isLastMessage={isLastMessage}
            />
          </motion.div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

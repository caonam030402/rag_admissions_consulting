import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";

import { ENameLocalS } from "@/constants";
import { ActorType } from "@/enums/systemChat";
import useChatBot from "@/hooks/features/chatbot/useChatBot";
import { chatService } from "@/services/chat";
import { useChatStore } from "@/stores/chat";

import ChatMessage from "./ChatMessage";
import ChatSuggestions from "./ChatSuggestions";

export default function Body() {
  const {
    messages,
    isTyping,
    currentConversationId,
    loadConversation,
    replaceMessages,
  } = useChatStore();
  const { sendMessage } = useChatBot();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversation history using the hook
  const { data: conversationData, isLoading } =
    chatService.useConversationHistory(currentConversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load conversation history when component mounts
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        // Get current conversation ID from localStorage
        const savedConversationId = localStorage.getItem(
          ENameLocalS.CURRENT_CONVERSATION_ID,
        );

        console.log("🔧 Widget Debug - Loading chat history:", {
          savedConversationId,
          currentConversationId,
          messagesLength: messages.length,
        });

        if (
          savedConversationId &&
          savedConversationId !== currentConversationId
        ) {
          console.log(
            "📞 Widget Debug - Loading conversation:",
            savedConversationId,
          );
          // Load conversation
          loadConversation(savedConversationId);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadChatHistory();
  }, []); // Run only on mount

  // Update messages when conversation history loads
  useEffect(() => {
    console.log("🔧 Widget Debug - Conversation data changed:", {
      conversationData: conversationData?.data?.length || 0,
      currentConversationId,
      isLoading,
    });

    if (
      conversationData?.data &&
      conversationData.data.length > 0 &&
      currentConversationId
    ) {
      console.log(
        "✅ Widget Debug - Replacing messages:",
        conversationData.data.length,
      );
      replaceMessages(currentConversationId, conversationData.data);
    }
  }, [conversationData, currentConversationId, replaceMessages, isLoading]);

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({
      newMessage: suggestion,
      role: ActorType.Human,
    });
  };

  // Show suggestions only when there are messages and not currently typing
  const shouldShowSuggestions =
    messages.length > 0 &&
    !isTyping &&
    currentConversationId;
    // Temporarily remove the bot message condition for testing
    // messages[messages.length - 1]?.role === ActorType.Bot;

  return (
    <div className="flex h-full flex-col">
      <div className="scroll flex-1">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center p-4 text-center">
            <div className="text-gray-500">
              <div className="mb-2 text-2xl">💬</div>
              <div className="text-sm">Bắt đầu hội thoại mới</div>
              <div className="text-xs text-gray-400">
                Hỏi tôi về tuyển sinh, ngành học...
              </div>
            </div>
          </div>
        )}

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

        {/* Chat Suggestions */}
        {shouldShowSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-4 pb-3"
          >
            <ChatSuggestions
              conversationId={currentConversationId}
              messagesCount={messages.length}
              onSuggestionClick={handleSuggestionClick}
            />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

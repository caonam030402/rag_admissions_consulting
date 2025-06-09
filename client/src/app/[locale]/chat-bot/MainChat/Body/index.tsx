"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { Skeleton } from "@heroui/skeleton";

import ChatSuggestions from "@/components/business/ChatbotWidget/MainChat/ChatSuggestions";
import useChatBot from "@/hooks/features/chatbot/useChatBot";
import { shouldTriggerHumanHandoff } from "@/hooks/useHumanHandoff";
import { useChatStore } from "@/stores/chat";

import ChatMessage from "../ChatMessage";
import IntroChat from "../IntroChat";

interface BodyMainChatProps {
  humanHandoff: {
    status: any;
    isLoading: boolean;
    requestHumanSupport: (message: string) => void;
    endHandoff: () => void;
    timeoutRemaining: number;
    isWaiting: boolean;
    isConnected: boolean;
    adminName?: string;
  };
}

export default function BodyMainChat({ humanHandoff }: BodyMainChatProps) {
  const { messages, isTyping, currentConversationId } = useChatStore();
  const { sendMessage } = useChatBot();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { requestHumanSupport, isWaiting, isConnected } = humanHandoff;

  // Debug: Log messages changes
  useEffect(() => {
    console.log("🔧 DEBUG Body: Messages updated", {
      count: messages.length,
      lastMessage: messages[messages.length - 1],
      isTyping,
    });
  }, [messages, isTyping]);

  // Auto-scroll to bottom when messages change or when typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle initial loading state
  useEffect(() => {
    // Show skeleton for 1 second when switching conversations or first load
    setIsInitialLoading(true);
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentConversationId]);

  // Handle suggestion clicks
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      console.log("🔧 DEBUG - Suggestion clicked:", suggestion);

      // Check if this is a human handoff request
      if (shouldTriggerHumanHandoff(suggestion)) {
        console.log("🔧 DEBUG - Triggering human handoff for:", suggestion);
        requestHumanSupport(suggestion);
        return;
      }

      // Send regular message
      sendMessage({
        newMessage: suggestion,
      });
    },
    [requestHumanSupport, sendMessage],
  );

  // Show suggestions only when there are messages and not currently typing
  const shouldShowSuggestions =
    messages.length > 0 && !isTyping && currentConversationId;

  // Simple loading state without fake user messages
  const renderMessageSkeleton = () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Skeleton className="size-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-48 rounded mx-auto" />
          <Skeleton className="h-3 w-32 rounded mx-auto" />
        </div>
        {/* Loading dots */}
        <div className="flex justify-center space-x-1">
          <div className="size-2 animate-bounce rounded-full bg-blue-400" />
          <div className="size-2 animate-bounce rounded-full bg-blue-500 delay-75" />
          <div className="size-2 animate-bounce rounded-full bg-blue-600 delay-150" />
        </div>
      </div>
    </div>
  );

  // Handle different states without nested ternary
  if (isInitialLoading) {
    return (
      <div className="scroll h-[80vh] px-2 pb-20 pt-4">
        <div className="h-full pt-4">{renderMessageSkeleton()}</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="scroll h-[80vh] px-2 pb-20 pt-4">
        <div className="flex h-full flex-col items-center justify-center">
          <IntroChat />
          <div className="mt-4 text-center text-sm text-gray-500">
            Sử dụng các tính năng ở thanh bên để được hỗ trợ tốt hơn
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll h-[80vh] px-2 pb-20 pt-4">
      <div className="flex flex-col space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 p-4">
            <div className="size-2 animate-bounce rounded-full bg-blue-400" />
            <div className="size-2 animate-bounce rounded-full bg-blue-500 delay-100" />
            <div className="size-2 animate-bounce rounded-full bg-blue-600 delay-200" />
          </div>
        )}

        {/* Chat Suggestions */}
        {shouldShowSuggestions && (
          <div className="px-4 pb-4">
            <ChatSuggestions
              conversationId={currentConversationId}
              messagesCount={messages.length}
              onSuggestionClick={handleSuggestionClick}
              isHumanHandoffActive={isWaiting || isConnected}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

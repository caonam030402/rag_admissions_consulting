"use client";

import React from "react";

import {
  BottomNavigation,
  ConversationHistory,
  HomeHeader,
  LiveChatFooter,
  PopularQuestions,
  QuickActions,
} from "./components";

interface HomeChatProps {
  onChatStart: () => void;
  activeTab?: "home" | "chat";
  onTabChange?: (tab: "home" | "chat") => void;
}

export default function HomeChat({
  onChatStart,
  activeTab,
  onTabChange,
}: HomeChatProps) {
  const handleStartChat = () => {
    onChatStart();
  };

  const handleConversationSelect = (_conversationId: string) => {
    onChatStart();
  };

  const handleQuickAction = (_topic: string) => {
    handleStartChat();
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        <HomeHeader onHistoryClick={() => {}} />

        {/* Scrollable Content Area */}
        <div className="flex-1 scroll">
          <QuickActions onQuickAction={handleQuickAction} />

          {/* Conversation History */}
          <div className="mx-2 mb-2">
            <ConversationHistory
              onConversationSelect={handleConversationSelect}
            />
          </div>

          <PopularQuestions onQuestionClick={handleQuickAction} />
        </div>

        {/* Live Chat Footer - Fixed */}
        <LiveChatFooter onChatClick={handleStartChat} />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

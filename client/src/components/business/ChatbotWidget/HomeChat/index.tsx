import React from "react";

import type { TabTypeChatbotWidget } from "@/types/chat";

import Header from "../MainChat/Header";
import BottomNavigation from "./BottomNavigation";
import ConversationHistory from "./ConversationHistory";
import LiveChatFooter from "./LiveChatFooter";
import WelcomeSection from "./WelcomeSection";

interface HomeChatProps {
  onTabChange?: (tab: TabTypeChatbotWidget) => void;
  activeTab?: TabTypeChatbotWidget;
}

export default function HomeChat({
  onTabChange,
  activeTab = "home",
}: HomeChatProps) {
  const handleChatClick = () => {
    onTabChange && onTabChange("chat");
  };

  const handleTabSwitch = (tab: TabTypeChatbotWidget) => {
    onTabChange && onTabChange(tab);
  };

  const handleConversationSelect = (_conversationId: string) => {
    // Switch to chat tab when conversation is selected
    onTabChange && onTabChange("chat");
  };

  return (
    <div className="flex h-full flex-col">
      <Header handleTabSwitch={handleTabSwitch} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <WelcomeSection />
        <ConversationHistory onConversationSelect={handleConversationSelect} />
      </div>

      {/* Fixed footer area */}
      <div className="">
        <LiveChatFooter onChatClick={handleChatClick} />
        <p className="mb-2 text-center text-[10px] text-gray-500">
          Powered by <span className="font-bold">CaoNam</span>
        </p>
        <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  );
}

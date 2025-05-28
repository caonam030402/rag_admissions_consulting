import React from "react";

import Header from "../MainChat/Header";
import type { TabTypeChatbotWidget } from "../types";
import BottomNavigation from "./BottomNavigation";
import LiveChatFooter from "./LiveChatFooter";
import MenuList from "./MenuList";
import WelcomeSection from "./WelcomeSection";

interface HomeChatProps {
  onMenuItemClick?: (item: string) => void;
  onTabChange?: (tab: TabTypeChatbotWidget) => void;
  activeTab?: TabTypeChatbotWidget;
}

export default function HomeChat({
  onMenuItemClick,
  onTabChange,
  activeTab = "home",
}: HomeChatProps) {
  const handleChatClick = () => {
    onTabChange && onTabChange("chat");
  };
  return (
    <div className="flex h-full flex-col">
      <Header />
      <WelcomeSection />
      <MenuList onMenuItemClick={onMenuItemClick} />
      <LiveChatFooter onChatClick={handleChatClick} />
      <p className="mb-2 text-center text-[10px] text-gray-500">
        Powered by <span className="font-bold">CaoNam</span>
      </p>
      <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

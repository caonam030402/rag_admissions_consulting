"use client";

import React, { useEffect, useState } from "react";

import { ENameLocalS } from "@/constants";
import { useChatStore } from "@/stores/chat";
import type { TabTypeChatbotWidget } from "@/types/chat";

import { ChatWidget } from "./ChatWidget";
import { FloatingButton } from "./FloatingButton";

export default function ChatbotWidget1() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabTypeChatbotWidget>("home");
  const { loadConversation } = useChatStore();

  const toggleWidget = (): void => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveTab("home");
    }
  };

  const handleTabSwitch = (tab: TabTypeChatbotWidget) => {
    setActiveTab(tab);
  };

  // Load conversation when widget opens and switches to chat
  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      const savedConversationId = localStorage.getItem(
        ENameLocalS.CURRENT_CONVERSATION_ID,
      );
      if (savedConversationId) {
        console.log(
          "🔧 Widget - Loading conversation on tab switch:",
          savedConversationId,
        );
        loadConversation(savedConversationId);
      }
    }
  }, [isOpen, activeTab, loadConversation]);

  return (
    <>
      <FloatingButton isOpen={isOpen} onClick={toggleWidget} />
      <ChatWidget
        isOpen={isOpen}
        activeTab={activeTab}
        handleTabSwitch={handleTabSwitch}
      />
    </>
  );
}

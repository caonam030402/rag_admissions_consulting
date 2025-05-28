"use client";

import React, { useState } from "react";

import { ENameLocalS } from "@/constants";
import type { TabTypeChatbotWidget } from "@/types/chat";

import { ChatWidget } from "./ChatWidget";
import { FloatingButton } from "./FloatingButton";

export default function ChatbotWidget1() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabTypeChatbotWidget>("home");
  const [showEmailForm, setShowEmailForm] = useState(false);

  const toggleWidget = (): void => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveTab("home");
      setShowEmailForm(false);
    }
  };

  const handleTabSwitch = (tab: TabTypeChatbotWidget) => {
    setActiveTab(tab);
  };

  const checkEmailHasSaved = () => {
    const savedEmail = localStorage.getItem(ENameLocalS.EMAIL);
    return !!savedEmail;
  };

  return (
    <>
      <FloatingButton isOpen={isOpen} onClick={toggleWidget} />
      <ChatWidget
        isOpen={isOpen}
        activeTab={activeTab}
        showEmailForm={showEmailForm}
        setShowEmailForm={setShowEmailForm}
        handleTabSwitch={handleTabSwitch}
        checkEmailHasSaved={checkEmailHasSaved}
      />
    </>
  );
}

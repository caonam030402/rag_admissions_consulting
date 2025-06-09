"use client";

import React from "react";

import { useHumanHandoff } from "@/hooks/useHumanHandoff";
import { useChatStore } from "@/stores/chat";

import BodyMainChat from "./Body";
import EnterContent from "./EnterContent";
import HeaderMainChat from "./Header";
import SideNavigation from "./SideNavigation";

export default function MainChat() {
  const { currentConversationId } = useChatStore();
  const humanHandoff = useHumanHandoff({
    conversationId: currentConversationId,
  });

  return (
    <div className="from-blue-50 via-indigo-50 to-purple-50 flex h-screen bg-gradient-to-br">
      {/* Sidebar Navigation */}
      <SideNavigation />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        <HeaderMainChat />
        <div className="relative flex-1 overflow-hidden">
          <div className="mx-auto h-full max-w-4xl px-6">
            <BodyMainChat humanHandoff={humanHandoff} />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-6 pb-6">
              <EnterContent humanHandoff={humanHandoff} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

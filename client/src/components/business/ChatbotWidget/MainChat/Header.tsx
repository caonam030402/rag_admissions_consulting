"use client";

import { Button } from "@heroui/react";
import { House, Plus } from "@phosphor-icons/react";
import React from "react";

import { chatService } from "@/services/chat";
import { useChatStore } from "@/stores/chat";
import type { TabTypeChatbotWidget } from "@/types/chat";

interface HeaderProps {
  handleTabSwitch: (tab: TabTypeChatbotWidget) => void;
}

export default function Header({ handleTabSwitch }: HeaderProps) {
  const { startNewConversation } = useChatStore();
  const currentUser = chatService.getCurrentUser();

  const handleNewChat = () => {
    startNewConversation();
  };

  const handleGoHome = () => {
    handleTabSwitch("home");
  };

  return (
    <div className="flex items-center justify-between border-b bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="text-xl">🎓</div>
        <div>
          <span className="text-sm font-semibold text-gray-800">
            Trợ lý Tuyển sinh AI
          </span>
          <div className="text-xs text-gray-500">
            {currentUser?.userId ? (
              <span className="text-green-600">Đã đăng nhập</span>
            ) : (
              <span className="text-orange-600">
                Khách: {currentUser?.guestId?.slice(0, 8) || "Guest"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="light"
          size="sm"
          isIconOnly
          onClick={handleGoHome}
          className="text-gray-600 hover:text-gray-800"
        >
          <House size={16} />
        </Button>
        <Button
          variant="light"
          size="sm"
          isIconOnly
          onClick={handleNewChat}
          className="text-gray-600 hover:text-gray-800"
        >
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
}

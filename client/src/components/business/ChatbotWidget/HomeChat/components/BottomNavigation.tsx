"use client";

import { ChatCircle, House } from "@phosphor-icons/react";
import React from "react";

interface BottomNavigationProps {
  activeTab?: "home" | "chat";
  onTabChange?: (tab: "home" | "chat") => void;
}

export default function BottomNavigation({
  activeTab = "home",
  onTabChange,
}: BottomNavigationProps) {
  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-2">
      <div className="flex justify-around">
        <button
          type="button"
          onClick={() => onTabChange?.("home")}
          className={`flex flex-col items-center gap-1 p-2 ${
            activeTab === "home" ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <House size={20} weight={activeTab === "home" ? "fill" : "regular"} />
          <span className="text-xs">Trang chủ</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange?.("chat")}
          className={`flex flex-col items-center gap-1 p-2 ${
            activeTab === "chat" ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <ChatCircle
            size={20}
            weight={activeTab === "chat" ? "fill" : "regular"}
          />
          <span className="text-xs">Chat</span>
        </button>
      </div>
    </div>
  );
}

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
    <div className="border-t border-gray-200 bg-white px-4 py-2">
      <div className="flex justify-around">
        <button
          type="button"
          onClick={() => onTabChange?.("home")}
          className={`flex flex-col items-center rounded-lg px-4 py-2 transition-colors ${
            activeTab === "home"
              ? "bg-blue-50 text-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <House size={24} weight={activeTab === "home" ? "fill" : "regular"} />
          <span className="mt-1 text-xs font-medium">Home</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange?.("chat")}
          className={`flex flex-col items-center rounded-lg px-4 py-2 transition-colors ${
            activeTab === "chat"
              ? "bg-blue-50 text-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ChatCircle
            size={24}
            weight={activeTab === "chat" ? "fill" : "regular"}
          />
          <span className="mt-1 text-xs font-medium">Chat</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import { PaperPlaneTilt } from "@phosphor-icons/react";
import React from "react";

interface LiveChatFooterProps {
  onChatClick?: () => void;
}

export default function LiveChatFooter({ onChatClick }: LiveChatFooterProps) {
  const handleChatClick = () => {
    onChatClick && onChatClick();
  };
  return (
    <div className="mx-4 mb-4">
      <button
        type="button"
        onClick={handleChatClick}
        className="group flex w-full items-center justify-between rounded-lg border 
                   border-gray-200 bg-white p-4 
                   shadow-sm transition-all duration-200 hover:bg-blue-50"
      >
        <div className="text-left">
          <h3 className="mb-1 text-sm font-semibold text-gray-800">
            Chat ngay
          </h3>
          <p className="text-xs text-gray-600">Có thể giúp gì cho bạn?</p>
        </div>
        <div className="rounded-lg bg-blue-500 p-2 text-white transition-colors group-hover:bg-blue-600">
          <PaperPlaneTilt size={20} weight="fill" />
        </div>
      </button>
    </div>
  );
}

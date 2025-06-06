"use client";

import { CaretDown, ChatCircle } from "@phosphor-icons/react";
import React from "react";

interface HistoryToggleProps {
  onToggleHistory: () => void;
}

export default function HistoryToggle({ onToggleHistory }: HistoryToggleProps) {
  return (
    <div className="px-2 pb-2">
      <button
        type="button"
        onClick={onToggleHistory}
        className="group flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition-colors hover:bg-gray-50"
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-blue-100">
          <ChatCircle
            size={14}
            className="text-gray-600 transition-colors group-hover:text-blue-600"
          />
        </div>

        <div className="flex-1 text-left">
          <div className="text-xs font-semibold text-gray-800">
            📝 Lịch sử chat
          </div>
        </div>

        <div className="flex size-6 shrink-0 items-center justify-center">
          <CaretDown size={12} className="text-gray-600" />
        </div>
      </button>
    </div>
  );
} 
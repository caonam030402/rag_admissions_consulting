"use client";

import { ArrowLeft, ChatCircle } from "@phosphor-icons/react";
import React from "react";

import BaseHeader from "./BaseHeader";

interface HistoryHeaderProps {
  onBackClick: () => void;
}

export default function HistoryHeader({ onBackClick }: HistoryHeaderProps) {
  const leftElement = (
    <button
      type="button"
      onClick={onBackClick}
      aria-label="Quay lại trang chủ"
      className="flex size-9 items-center justify-center rounded-full bg-gray-100 transition-all hover:scale-105 hover:bg-gray-200"
    >
      <ArrowLeft size={16} className="text-gray-700" />
    </button>
  );

  const rightElement = (
    <div className="flex size-9 items-center justify-center rounded-full bg-blue-50">
      <ChatCircle size={18} weight="fill" className="text-blue-600" />
    </div>
  );

  return (
    <BaseHeader
      title="Lịch sử chat"
      subtitle="Chọn cuộc hội thoại để tiếp tục"
      leftElement={leftElement}
      rightElement={rightElement}
    />
  );
} 
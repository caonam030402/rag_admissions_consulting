"use client";

import { ChatCircle } from "@phosphor-icons/react";
import React from "react";

import BaseHeader from "./BaseHeader";

interface HomeHeaderProps {
  onHistoryClick: () => void;
}

export default function HomeHeader({ onHistoryClick }: HomeHeaderProps) {
  const leftElement = <div className="text-base">🎓</div>;

  const rightElement = (
    <button
      type="button"
      onClick={onHistoryClick}
      aria-label="Xem lịch sử chat"
      className="flex size-9 items-center justify-center rounded-full bg-gray-100 transition-all hover:scale-105 hover:bg-gray-200"
    >
      <ChatCircle size={16} className="text-gray-700" />
    </button>
  );

  return (
    <BaseHeader
      title="Tư vấn tuyển sinh AI"
      subtitle="Chào mừng bạn đến với hệ thống"
      leftElement={leftElement}
      rightElement={rightElement}
    />
  );
}

"use client";

import { ChatCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import React from "react";

interface LiveChatFooterProps {
  onChatClick: () => void;
}

export default function LiveChatFooter({ onChatClick }: LiveChatFooterProps) {
  return (
    <div className="shrink-0 p-3">
      <button
        type="button"
        onClick={onChatClick}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
      >
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold">Bắt đầu chat ngay</div>
          <div className="text-xs text-blue-100">
            Hỏi bất cứ điều gì về tuyển sinh
          </div>
        </div>

        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
          <PaperPlaneTilt size={16} weight="fill" />
        </div>
      </button>
    </div>
  );
}

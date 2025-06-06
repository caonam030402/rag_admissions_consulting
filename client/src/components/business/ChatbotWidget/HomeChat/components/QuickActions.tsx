"use client";

import {
  BookOpen,
  Calendar,
  CurrencyDollar,
  Phone,
} from "@phosphor-icons/react";
import React from "react";

interface QuickActionsProps {
  onQuickAction: (topic: string) => void;
}

export default function QuickActions({ onQuickAction }: QuickActionsProps) {
  const actions = [
    {
      id: "thông tin ngành học",
      title: "Thông tin ngành",
      icon: BookOpen,
    },
    {
      id: "học phí",
      title: "Học phí",
      icon: CurrencyDollar,
    },
    {
      id: "lịch tuyển sinh",
      title: "Lịch tuyển sinh",
      icon: Calendar,
    },
    {
      id: "liên hệ",
      title: "Liên hệ",
      icon: Phone,
    },
  ];

  return (
    <div className="mx-2 mb-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
    
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onQuickAction(action.id)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 text-left transition-colors hover:bg-blue-50"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-blue-100">
                <IconComponent size={12} className="text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-800">
                  {action.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
} 
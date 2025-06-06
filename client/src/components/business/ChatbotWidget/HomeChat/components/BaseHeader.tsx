"use client";

import { ChatCircle } from "@phosphor-icons/react";
import React from "react";

interface BaseHeaderProps {
  title: string;
  subtitle: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export default function BaseHeader({
  title,
  subtitle,
  leftElement,
  rightElement,
}: BaseHeaderProps) {
  return (
    <div className="shrink-0 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {leftElement || (
          <div className="flex size-9 items-center justify-center rounded-full bg-blue-50">
            <ChatCircle size={18} weight="fill" className="text-blue-600" />
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        {rightElement || (
          <div className="flex size-9 items-center justify-center rounded-full bg-blue-50">
            <ChatCircle size={18} weight="fill" className="text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
} 
"use client";

import React from "react";

interface MenuItemProps {
  title: string;
  onClick?: () => void;
  className?: string;
}

export default function MenuItem({
  title,
  onClick,
  className = "",
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex w-full items-center justify-between border-b 
        border-gray-100 px-4 py-3 text-left
        text-sm text-gray-700 transition-colors duration-200 last:border-b-0
        hover:bg-gray-50
        ${className}
      `}
    >
      <span className="font-medium">{title}</span>
      <span className="text-lg text-gray-400">›</span>
    </button>
  );
}

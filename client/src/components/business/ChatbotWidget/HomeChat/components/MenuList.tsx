"use client";

import React from "react";

import MenuItem from "./MenuItem";

interface MenuListProps {
  onMenuItemClick?: (item: string) => void;
}

export default function MenuList({ onMenuItemClick }: MenuListProps) {
  const menuItems = [
    "What is Lyro?",
    "Discover Tidio Premium",
    "How can I log into my account?",
    "How can I manage my subscription?",
    "How can I learn about Tidio?",
  ];

  return (
    <div className="scroll mx-4 mb-4 flex-1 rounded-lg border border-gray-200 bg-white shadow-sm">
      {menuItems.map((item, index) => (
        <MenuItem
          key={index}
          title={item}
          onClick={() => onMenuItemClick?.(item)}
        />
      ))}
    </div>
  );
}

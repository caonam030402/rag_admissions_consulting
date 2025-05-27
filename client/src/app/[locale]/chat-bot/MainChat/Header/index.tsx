"use client";

import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import React from "react";

export default function HeaderMainChat() {
  return (
    <div className="flex items-center justify-between border-b border-white/20 bg-white/10 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="text-2xl">🎓</div>
          <span className="text-xl font-semibold text-gray-800">
            Trợ lý Tuyển sinh AI
          </span>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button variant="light" size="sm" className="text-gray-600">
              GPT-4
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem key="gpt4">GPT-4 Turbo</DropdownItem>
            <DropdownItem key="gpt3">GPT-3.5</DropdownItem>
            <DropdownItem key="claude">Claude 3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="light"
          size="sm"
          className="text-gray-600 hover:text-gray-800"
        >
          New Chat
        </Button>
        <Avatar
          src="https://i.pravatar.cc/150?u=judha"
          size="sm"
          name="Judha Maygustya"
        />
      </div>
    </div>
  );
}

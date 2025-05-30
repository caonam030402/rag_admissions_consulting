"use client";

import UserSetting from "@/components/business/UserSetting";
import { userService } from "@/services/user";
import { Avatar, Button } from "@heroui/react";
import React from "react";

export default function HeaderMainChat() {
  const { user } = userService.useProfile();
  return (
    <div className="flex items-center justify-between border-b border-white/20 bg-white/10 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="text-2xl">🎓</div>
          <span className="text-xl font-semibold text-gray-800">
            Trợ lý Tuyển sinh AI
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* <Button
          variant="solid"
          size="sm"
          className="text-gray-600 hover:text-gray-800"
        >
          New Chat
        </Button> */}
        <UserSetting
          onlyAvatar
          info={{
            name: user?.name,
            avatar: user?.avatar,
            email: user?.email,
          }}
        />
      </div>
    </div>
  );
}

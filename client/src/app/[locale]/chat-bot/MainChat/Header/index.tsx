"use client";

import { Avatar, Button } from "@heroui/react";
import { Plus } from "@phosphor-icons/react";
import React from "react";

import UserSetting from "@/components/business/UserSetting";
import { userService } from "@/services/user";
import { useChatStore } from "@/stores/chat";

export default function HeaderMainChat() {
  const { user } = userService.useProfile();
  const { startNewConversation } = useChatStore();

  const handleNewChat = () => {
    startNewConversation();
  };

  return (
    <div className="flex items-center justify-between border-b border-white/20 bg-white/10 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="text-2xl">🎓</div>
          <div>
            <span className="text-xl font-semibold text-gray-800">
              Trợ lý Tuyển sinh AI
            </span>
            <div className="text-sm text-gray-600">
              {user ? (
                <span className="text-green-600">
                  Đã đăng nhập: {user.name || user.email}
                </span>
              ) : (
                <span className="text-orange-600">
                  Chế độ khách - Lịch sử sẽ được lưu tạm thời
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="solid"
          size="sm"
          className="text-gray-600 hover:text-gray-800 bg-white/80"
          onClick={handleNewChat}
          startContent={<Plus size={16} />}
        >
          Hội thoại mới
        </Button>

        {user && (
          <UserSetting
            onlyAvatar
            info={{
              name: user?.name,
              avatar: user?.avatar,
              email: user?.email,
            }}
          />
        )}

        {!user && (
          <div className="text-sm">
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Đăng nhập
            </a>
            <span className="text-gray-500 mx-2">•</span>
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Đăng ký
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

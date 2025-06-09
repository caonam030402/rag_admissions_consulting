"use client";

import { Button, Input, Tooltip } from "@heroui/react";
import {
  Books,
  Calculator,
  ChartBar,
  GraduationCap,
  LightbulbFilament,
  Microphone,
  PaperPlaneRight,
  UsersFour,
} from "@phosphor-icons/react";
import React from "react";

import { TRIGGER_CONTACT_CABINET } from "@/constants/common";
import useChatBot from "@/hooks/features/chatbot/useChatBot";
import { shouldTriggerHumanHandoff } from "@/hooks/useHumanHandoff";

interface EnterContentProps {
  humanHandoff: {
    status: any;
    isLoading: boolean;
    requestHumanSupport: (message: string) => void;
    endHandoff: () => void;
    timeoutRemaining: number;
    isWaiting: boolean;
    isConnected: boolean;
    adminName?: string;
  };
}

export default function EnterContent({ humanHandoff }: EnterContentProps) {
  const { sendMessage, inputRef, message, setMessage, isTyping } = useChatBot();
  const { requestHumanSupport, isWaiting, isConnected } = humanHandoff;

  const handleSendMessage = () => {
    const messageContent = message.trim();
    if (!messageContent) return;

    // Check if this is a human handoff request
    if (shouldTriggerHumanHandoff(messageContent)) {
      requestHumanSupport(messageContent);
    } else {
      sendMessage({});
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const FeatureButtons = [
    {
      icon: <LightbulbFilament size={18} />,
      label: "Khảo sát chọn ngành",
      tooltip: "Làm khảo sát để tìm ngành phù hợp",
      action: () => {
        sendMessage({ newMessage: "Tôi muốn làm khảo sát chọn ngành học phù hợp" });
      },
    },
    {
      icon: <Calculator size={18} />,
      label: "Dự đoán điểm",
      tooltip: "Dự đoán khả năng trúng tuyển",
      action: () => {
        sendMessage({ newMessage: "Tôi muốn dự đoán khả năng trúng tuyển vào trường" });
      },
    },
    {
      icon: <GraduationCap size={18} />,
      label: "Ngành học",
      tooltip: "Thông tin ngành học",
      action: () => {
        sendMessage({ newMessage: "Cho tôi biết thông tin về các ngành học của trường" });
      },
    },
    {
      icon: <Books size={18} />,
      label: "Học bổng",
      tooltip: "Thông tin học bổng",
      action: () => {
        sendMessage({ newMessage: "Tôi muốn tìm hiểu về các chương trình học bổng" });
      },
    },
    {
      icon: <ChartBar size={18} />,
      label: "Thống kê",
      tooltip: "Điểm chuẩn & thống kê",
      action: () => {
        sendMessage({ newMessage: "Cho tôi xem điểm chuẩn và thống kê tuyển sinh" });
      },
    },
    {
      icon: <UsersFour size={18} />,
      label: "Tư vấn viên",
      tooltip: isWaiting || isConnected ? "Đã kết nối tư vấn viên" : "Kết nối với tư vấn viên",
      action: () => {
        if (!isWaiting && !isConnected) {
          requestHumanSupport(TRIGGER_CONTACT_CABINET);
        }
      },
      disabled: isWaiting || isConnected,
      color: (isWaiting || isConnected) ? "success" : "default" as const,
    },
  ];

  return (
    <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
      {/* Human Handoff Status */}
      {(isWaiting || isConnected) && (
        <div className="mb-3 rounded-lg bg-green-50 p-3 text-sm">
          {isWaiting && (
            <div className="flex items-center gap-2 text-amber-700">
              <div className="size-2 animate-pulse rounded-full bg-amber-500" />
              Đang tìm tư vấn viên...
            </div>
          )}
          {isConnected && (
            <div className="flex items-center gap-2 text-green-700">
              <div className="size-2 rounded-full bg-green-500" />
              Đã kết nối với tư vấn viên
              {humanHandoff.adminName && ` - ${humanHandoff.adminName}`}
            </div>
          )}
        </div>
      )}

      {/* Feature Buttons */}
      <div className="mb-4 flex items-center justify-center gap-2">
        {FeatureButtons.map((item, index) => (
          <Tooltip key={index} content={item.tooltip || item.label}>
            <Button
              variant="light"
              size="sm"
              isIconOnly
              color={item.color || "default"}
              className={`transition-colors ${
                item.disabled
                  ? "cursor-not-allowed opacity-50"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
              onPress={item.disabled ? undefined : item.action}
              isDisabled={item.disabled}
            >
              {item.icon}
            </Button>
          </Tooltip>
        ))}
      </div>

      {/* Input Area */}
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Hỏi tôi về tuyển sinh, ngành học, học phí, học bổng..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isTyping}
          classNames={{
            base: "w-full",
            mainWrapper: "h-full",
            input: "text-sm",
            inputWrapper:
              "h-12 px-4 bg-gray-50 border border-gray-200 hover:border-gray-300 focus-within:border-blue-400 rounded-xl transition-colors",
          }}
          endContent={
            <div className="flex items-center gap-2">
              <Button
                variant="light"
                size="sm"
                isIconOnly
                className="text-gray-500 hover:text-gray-700"
              >
                <Microphone size={18} />
              </Button>
              <Button
                size="sm"
                color="primary"
                isIconOnly
                onPress={handleSendMessage}
                isDisabled={!message.trim() || isTyping}
                className="size-8 min-w-8 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <PaperPlaneRight size={16} weight="fill" />
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}

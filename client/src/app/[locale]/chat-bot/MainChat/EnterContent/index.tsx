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
} from "@phosphor-icons/react";
import React from "react";

import useChatBot from "@/hooks/features/chatbot/useChatBot";

const FeatureButtons = [
  {
    icon: <LightbulbFilament size={18} />,
    label: "Khảo sát chọn ngành",
    tooltip: "Làm khảo sát để tìm ngành phù hợp",
    action: () => {
      console.log("Survey not implemented in input area");
    },
  },
  {
    icon: <Calculator size={18} />,
    label: "Dự đoán điểm",
    tooltip: "Dự đoán khả năng trúng tuyển",
    action: () => {
      console.log("Score prediction not implemented");
    },
  },
  {
    icon: <GraduationCap size={18} />,
    label: "Ngành học",
    tooltip: "Thông tin ngành học",
    action: () => {
      console.log("Major information not implemented");
    },
  },
  {
    icon: <Books size={18} />,
    label: "Học bổng",
    tooltip: "Thông tin học bổng",
    action: () => {
      console.log("Scholarship information not implemented");
    },
  },
  {
    icon: <ChartBar size={18} />,
    label: "Thống kê",
    tooltip: "Điểm chuẩn & thống kê",
    action: () => {
      console.log("Statistics not implemented");
    },
  },
];

export default function EnterContent() {
  const { sendMessage, inputRef, message, setMessage, isTyping } = useChatBot();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage({});
    }
  };

  return (
    <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
      {/* Feature Buttons */}
      <div className="mb-4 flex items-center justify-center gap-2">
        {FeatureButtons.map((item, index) => (
          <Tooltip key={index} content={item.tooltip || item.label}>
            <Button
              variant="light"
              size="sm"
              isIconOnly
              className="text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
              onPress={item.action}
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
                onPress={() => sendMessage({})}
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

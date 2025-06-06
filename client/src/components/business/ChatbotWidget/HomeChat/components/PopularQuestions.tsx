"use client";

import {
  Calendar,
  FileText,
  MapPin,
  Question,
  Star,
} from "@phosphor-icons/react";
import React from "react";

interface PopularQuestionsProps {
  onQuestionClick: (topic: string) => void;
}

export default function PopularQuestions({ onQuestionClick }: PopularQuestionsProps) {
  const questions = [
    {
      id: "điều kiện xét tuyển",
      text: "Điều kiện xét tuyển như thế nào?",
      icon: Question,
    },
    {
      id: "cơ sở vật chất",
      text: "Cơ sở vật chất và địa điểm học tập?",
      icon: MapPin,
    },
    {
      id: "học bổng",
      text: "Có những chương trình học bổng nào?",
      icon: Star,
    },
    {
      id: "thủ tục nhập học",
      text: "Thủ tục nhập học cần chuẩn bị gì?",
      icon: FileText,
    },
    {
      id: "thời gian học",
      text: "Thời gian học và lịch trình ra sao?",
      icon: Calendar,
    },
  ];

  return (
    <div className="px-3 pb-3">
      <h2 className="mb-2 text-sm font-semibold text-gray-800">
        Câu hỏi thường gặp
      </h2>
      <div className="space-y-2">
        {questions.map((question) => {
          const IconComponent = question.icon;
          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onQuestionClick(question.id)}
              className="flex w-full items-center gap-2 rounded-lg bg-gray-50 p-2.5 text-left transition-colors hover:bg-gray-100"
            >
              <IconComponent size={12} className="text-gray-600" />
              <span className="text-xs text-gray-700">
                {question.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
} 
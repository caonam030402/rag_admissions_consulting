"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Books,
  Calculator,
  ChartBar,
  GraduationCap,
  LightbulbFilament,
  List,
  MapTrifold,
  X,
} from "@phosphor-icons/react";

import Button from "@/components/common/Button";
import { ActorType } from "@/enums/systemChat";
import { chatService } from "@/services/chat";
import { useChatStore } from "@/stores/chat";
import { formatSurveyData } from "@/utils/common";

import AdmissionPredictor from "../AdmissionPredictor";
import CampusTour from "../CampusTour";
import SurveyForm from "../SurveyForm";

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: string;
}

const NavigationItems: NavigationItem[] = [
  {
    icon: <LightbulbFilament size={28} weight="fill" />,
    label: "Khảo sát chọn ngành",
    description: "Chưa biết nên học ngành gì? Hãy làm khảo sát!",
    action: "survey",
  },
  {
    icon: <Calculator size={28} weight="fill" />,
    label: "Dự đoán trúng tuyển",
    description: "Tính toán khả năng trúng tuyển theo điểm thi",
    action: "predictor",
  },
  {
    icon: <MapTrifold size={28} weight="fill" />,
    label: "Tham quan ảo",
    description: "Trải nghiệm tham quan khuôn viên trường trực tuyến",
    action: "campusTour",
  },
  {
    icon: <Books size={28} weight="fill" />,
    label: "Thông tin ngành học",
    description: "Tìm hiểu về các ngành đào tạo",
    action: "majors",
  },
  {
    icon: <GraduationCap size={28} weight="fill" />,
    label: "Học bổng & Hỗ trợ",
    description: "Thông tin về học bổng và hỗ trợ tài chính",
    action: "scholarships",
  },
  {
    icon: <ChartBar size={28} weight="fill" />,
    label: "Thống kê tuyển sinh",
    description: "Dữ liệu điểm chuẩn các năm trước",
    action: "statistics",
  },
];

// Map of action types to chat queries
const ACTION_QUERIES: Record<string, string> = {
  majors: "Trường có những ngành đào tạo nào?",
  scholarships: "Thông tin về học bổng và hỗ trợ tài chính?",
  statistics: "Điểm chuẩn các ngành những năm gần đây là bao nhiêu?",
};

export default function SideNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showPredictor, setShowPredictor] = useState(false);
  const [showCampusTour, setShowCampusTour] = useState(false);
  const { addMessage, setTyping, setError } = useChatStore();

  // Handle sending a message via chat system
  const sendMessage = async (messageText: string) => {
    // Add user message to chat
    addMessage({
      id: uuidv4(),
      content: messageText,
      role: ActorType.Human,
      timestamp: Date.now(),
    });

    // Close sidebar on mobile
    setIsOpen(false);
    setTyping(true);

    try {
      // Start a new empty assistant message
      useChatStore.getState().startNewAssistantMessage();

      // Stream the response
      for await (const token of chatService.streamMessage(messageText)) {
        useChatStore.getState().appendToLastMessage(token);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send message",
      );
    } finally {
      setTyping(false);
    }
  };

  const handleSurveySubmit = async (data: Record<string, unknown>) => {
    const content = formatSurveyData(data);
    setShowSurvey(false);
    await sendMessage(content);
  };

  const handleAction = (action: string) => {
    // Handle modal actions
    if (action === "survey") {
      setShowSurvey(true);
      return;
    } 
    
    if (action === "predictor") {
      setShowPredictor(true);
      return;
    } 
    
    if (action === "campusTour") {
      setShowCampusTour(true);
      return;
    }

    // Handle chat query actions
    if (action in ACTION_QUERIES) {
      sendMessage(ACTION_QUERIES[action]);
    }
  };

  return (
    <>
      {/* Mobile toggle button */}
      <div className="fixed left-4 top-20 z-20 md:hidden">
        <Button
          isIconOnly
          className="rounded-full bg-blue-500 text-white shadow-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <List size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed z-10 h-full w-80 border-r border-gray-200 bg-white shadow-md transition-transform duration-300 md:relative md:shadow-none`}
      >
        <div className="flex h-full flex-col p-6">
          <div className="space-y-5">
            {NavigationItems.map((item, index) => (
              <button
                key={index}
                type="button"
                className="w-full cursor-pointer rounded-xl border border-gray-200 p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
                onClick={() => handleAction(item.action)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center rounded-lg bg-blue-100 p-2 text-blue-600">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-medium text-gray-800">
                      {item.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-auto border-t border-gray-200 pt-4">
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} Trợ lý tuyển sinh AI
            </div>
          </div>
        </div>
      </div>

      {/* Feature modals */}
      {showSurvey && (
        <SurveyForm
          onSubmit={handleSurveySubmit}
          onClose={() => setShowSurvey(false)}
        />
      )}

      {showPredictor && (
        <AdmissionPredictor
          onSubmit={sendMessage}
          onClose={() => setShowPredictor(false)}
        />
      )}

      {showCampusTour && (
        <CampusTour
          onSubmit={sendMessage}
          onClose={() => setShowCampusTour(false)}
        />
      )}
    </>
  );
}

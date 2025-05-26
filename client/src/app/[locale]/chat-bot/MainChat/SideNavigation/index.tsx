"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  House,
  GraduationCap,
  Calculator,
  MapTrifold,
  Books,
  ChartBar,
  LightbulbFilament,
  Plus,
  X,
  Question,
  Clock,
  User,
  Gear,
} from "@phosphor-icons/react";
import { Button, Divider, Card, CardBody } from "@heroui/react";

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
  isActive?: boolean;
  action?: string;
  description?: string;
}

// Main Navigation - Core Features
const MainNavigation: NavigationItem[] = [
  {
    icon: <House size={20} weight="fill" />,
    label: "Trang chủ",
    isActive: true,
    description: "Màn hình chính",
  },
];

// Consultation Tools - Công cụ tư vấn
const ConsultationTools: NavigationItem[] = [
  {
    icon: <LightbulbFilament size={20} weight="fill" />,
    label: "Khảo sát chọn ngành",
    action: "survey",
    description: "Tìm ngành học phù hợp",
  },
  {
    icon: <Calculator size={20} weight="fill" />,
    label: "Dự đoán điểm",
    action: "predictor",
    description: "Dự đoán điểm thi đại học",
  },
];

// Information & Resources - Thông tin & Tài nguyên
const InformationResources: NavigationItem[] = [
  {
    icon: <GraduationCap size={20} weight="fill" />,
    label: "Ngành học",
    action: "majors",
    description: "Thông tin các ngành đào tạo",
  },
  {
    icon: <Books size={20} weight="fill" />,
    label: "Học bổng",
    action: "scholarships",
    description: "Chính sách học bổng",
  },
  {
    icon: <ChartBar size={20} weight="fill" />,
    label: "Thống kê",
    action: "statistics",
    description: "Điểm chuẩn & thống kê",
  },
];

// Experience - Trải nghiệm
const ExperienceTools: NavigationItem[] = [
  {
    icon: <MapTrifold size={20} weight="fill" />,
    label: "Tham quan ảo",
    action: "campusTour",
    description: "Khám phá khuôn viên trường",
  },
];

// Quick Questions - Organized by category
const QuickQuestions = {
  "Thông tin cơ bản": [
    "Học phí các ngành là bao nhiêu?",
    "Điều kiện xét tuyển như thế nào?",
    "Trường có những ngành đào tạo nào?",
  ],
  "Sinh hoạt sinh viên": [
    "Thông tin về ký túc xá?",
    "Cuộc trò chuyện gần đây",
    "Hỏi về học bổng sinh viên giỏi",
  ],
  "Tuyển sinh": [
    "Điểm chuẩn năm 2024",
    "Thủ tục nhập học online",
    "Chương trình đào tạo Công nghệ thông tin",
  ],
};

// Recent Chats
const RecentChats = [
  "Hỏi về học bổng sinh viên giỏi",
  "Điểm chuẩn năm 2024",
  "Thủ tục nhập học online",
  "Chương trình đào tạo Công nghệ thông tin",
  "Thông tin về ký túc xá",
  "Học phí ngành Kinh tế",
];

// Map of action types to chat queries
const ACTION_QUERIES: Record<string, string> = {
  majors:
    "Trường có những ngành đào tạo nào? Cho tôi biết chi tiết về các chương trình học.",
  scholarships: "Thông tin về học bổng và hỗ trợ tài chính cho sinh viên?",
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
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setTyping(false);
    }
  };

  const handleSurveySubmit = async (data: any) => {
    const content = formatSurveyData(data);
    setShowSurvey(false);
    await sendMessage(content);
  };

  const handleAction = (action?: string) => {
    if (!action) return;

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
      const query = ACTION_QUERIES[action];
      if (query) {
        sendMessage(query);
      }
    }
  };

  const renderNavigationSection = (title: string, items: NavigationItem[]) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3 px-2">
        <span>{title}</span>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-gray-100 group ${
              item.isActive
                ? "bg-blue-50 text-blue-600 border border-blue-200"
                : "text-gray-700 hover:text-gray-900"
            }`}
            onClick={() => handleAction(item.action)}
          >
            <div
              className={`${item.isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}`}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{item.label}</div>
              {item.description && (
                <div className="text-xs text-gray-500 truncate">
                  {item.description}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <div className="fixed left-4 top-20 z-20 md:hidden">
        <Button
          isIconOnly
          className="rounded-full bg-blue-500 text-white shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Plus size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed z-10 h-full w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-xl transition-transform duration-300 md:relative md:shadow-none`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xl">
              🎓
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                Tuyển sinh AI
              </div>
              <div className="text-xs text-gray-500">
                Trợ lý tư vấn thông minh
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 scroll p-4 space-y-2">
            {/* Main Navigation */}
            {renderNavigationSection("ĐIỀU HƯỚNG", MainNavigation)}

            {/* Consultation Tools */}
            {renderNavigationSection("CÔNG CỤ TƯ VẤN", ConsultationTools)}

            {/* Information & Resources */}
            {renderNavigationSection(
              "THÔNG TIN & TÀI NGUYÊN",
              InformationResources
            )}

            {/* Experience Tools */}
            {renderNavigationSection(
              "TRẢI NGHIỆM",
              ExperienceTools,
              <MapTrifold size={14} />
            )}

            <Divider className="" />

            {/* Recent Chats */}
            <div className="">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2 mt-4 px-2">
                <Clock size={14} />
                <span>CUỘC TRÒ CHUYỆN GẦN ĐÂY</span>
              </div>
              <div className="space-y-1">
                {RecentChats.slice(0, 6).map((chat, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-2 py-2 rounded transition-colors line-clamp-2"
                    onClick={() => sendMessage(chat)}
                  >
                    {chat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer - User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                <User size={20} weight="fill" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">
                  Thí sinh
                </div>
                <div className="text-xs text-gray-500">
                  Đang tư vấn tuyển sinh
                </div>
              </div>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
              >
                <Gear size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature modals */}
      {showSurvey && (
        <SurveyForm
          onClose={() => setShowSurvey(false)}
          onSubmit={handleSurveySubmit}
        />
      )}

      {showPredictor && (
        <AdmissionPredictor
          onClose={() => setShowPredictor(false)}
          onSubmit={sendMessage}
        />
      )}

      {showCampusTour && (
        <CampusTour
          onClose={() => setShowCampusTour(false)}
          onSubmit={sendMessage}
        />
      )}
    </>
  );
}

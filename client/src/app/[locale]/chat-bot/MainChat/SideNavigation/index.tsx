"use client";

import { Button, Divider } from "@heroui/react";
import {
  Books,
  Calculator,
  ChartBar,
  Clock,
  Gear,
  GraduationCap,
  House,
  LightbulbFilament,
  MapTrifold,
  Plus,
  User,
  X,
  ChatCircle,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

import useChatBot from "@/hooks/features/chatbot/useChatBot";
import { formatSurveyData } from "@/utils/common";
import { useChatStore } from "@/stores/chat";
import {
  useConversations,
  useConversationHistory,
  useUpdateConversationTitle,
} from "@/hooks/features/chatbot/useChatHistory";

import AdmissionPredictor from "../AdmissionPredictor";
import CampusTour from "../CampusTour";
import SurveyForm from "../SurveyForm";
import type { SurveyFormSchema } from "../SurveyForm/validates";

dayjs.extend(relativeTime);
dayjs.locale("vi");

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

const RecentChats = [
  "Hỏi về học bổng sinh viên giỏi",
  "Điểm chuẩn năm 2024",
  "Thủ tục nhập học online",
  "Chương trình đào tạo Công nghệ thông tin",
  "Thông tin về ký túc xá",
  "Học phí ngành Kinh tế",
];

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
  const { sendMessage } = useChatBot();

  // React Query hooks for chat history
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useConversations();

  const updateConversationTitleMutation = useUpdateConversationTitle();

  // Zustand store for current conversation tracking
  const {
    currentConversationId,
    startNewConversation,
    loadConversation,
    clearMessages,
    addMessage,
  } = useChatStore();

  // Load conversation history when currentConversationId changes
  const { data: conversationMessages = [], isLoading: isLoadingHistory } =
    useConversationHistory(currentConversationId);

  // Update messages in store when conversation history loads
  useEffect(() => {
    if (conversationMessages.length > 0) {
      clearMessages();
      conversationMessages.forEach((message) => addMessage(message));
    }
  }, [conversationMessages, clearMessages, addMessage]);

  const handleSurveySubmit = async (data: SurveyFormSchema) => {
    const content = formatSurveyData(data);
    setShowSurvey(false);
    await sendMessage({ newMessage: content });
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
        sendMessage({ newMessage: query });
      }
    }
  };

  const handleConversationClick = (conversationId: string) => {
    if (conversationId !== currentConversationId) {
      loadConversation(conversationId);
    }
  };

  const handleUpdateTitle = (conversationId: string, currentTitle: string) => {
    const newTitle = prompt("Nhập tiêu đề mới:", currentTitle);
    if (newTitle && newTitle !== currentTitle) {
      updateConversationTitleMutation.mutate({
        conversationId,
        title: newTitle,
      });
    }
  };

  const handleNewChat = () => {
    // Start new conversation
    startNewConversation();
    // Clear current messages
    clearMessages();
  };

  const getConversationTitle = (conv: any) => {
    return (
      conv.title ||
      conv.lastMessage.slice(0, 30) +
        (conv.lastMessage.length > 30 ? "..." : "")
    );
  };

  const renderNavigationSection = (title: string, items: NavigationItem[]) => (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2 px-2 text-xs font-semibold text-gray-500">
        <span>{title}</span>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-gray-100 ${
              item.isActive
                ? "border border-blue-200 bg-blue-50 text-blue-600"
                : "text-gray-700 hover:text-gray-900"
            }`}
            onClick={() => handleAction(item.action)}
          >
            <div
              className={`${item.isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}`}
            >
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{item.label}</div>
              {item.description && (
                <div className="truncate text-xs text-gray-500">
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
        } fixed z-10 h-full w-80 border-r border-gray-200 bg-white/95 shadow-xl backdrop-blur-sm transition-transform duration-300 md:relative md:shadow-none`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-200 p-6">
            <div className="from-blue-500 to-purple-500 flex size-10 items-center justify-center rounded-xl bg-gradient-to-r text-xl">
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
          <div className="scroll flex-1 space-y-2 p-4 overflow-y-auto">
            {/* New Chat Button */}
            <div className="mb-4">
              <Button
                className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                startContent={<Plus size={16} />}
                onClick={handleNewChat}
              >
                Cuộc trò chuyện mới
              </Button>
            </div>

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
            {renderNavigationSection("TRẢI NGHIỆM", ExperienceTools)}

            <Divider className="" />

            {/* Recent Chats */}
            <div className="">
              <div className="mb-2 mt-4 flex items-center gap-2 px-2 text-xs font-semibold text-gray-500">
                <Clock size={14} />
                <span>CUỘC TRÒ CHUYỆN GẦN ĐÂY</span>
              </div>
              <div className="space-y-1">
                {RecentChats.slice(0, 6).map((chat, index) => (
                  <button
                    key={index}
                    type="button"
                    className="line-clamp-2 w-full rounded p-2 text-left text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
                    onClick={() => sendMessage({ newMessage: chat })}
                  >
                    {chat}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat History with React Query */}
            <div className="">
              <div className="mb-2 mt-4 flex items-center gap-2 px-2 text-xs font-semibold text-gray-500">
                <ChatCircle size={14} />
                <span>LỊCH SỬ HỘI THOẠI</span>
                {/* Debug badge */}
                {conversations.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-xs">
                    {conversations.length}
                  </span>
                )}
              </div>

              {conversationsError && (
                <div className="p-3 text-center text-xs text-red-500">
                  Lỗi:{" "}
                  {conversationsError instanceof Error
                    ? conversationsError.message
                    : "Không thể tải lịch sử"}
                </div>
              )}

              {isLoadingConversations ? (
                <div className="p-3 text-center text-xs text-gray-500">
                  Đang tải lịch sử...
                </div>
              ) : conversations.length > 0 ? (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {conversations.slice(0, 10).map((conversation) => (
                    <motion.div
                      key={conversation.conversationId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group relative rounded p-2 text-xs cursor-pointer transition-colors hover:bg-gray-50 ${
                        currentConversationId === conversation.conversationId
                          ? "bg-blue-50 border-l-2 border-blue-500"
                          : ""
                      }`}
                      onClick={() =>
                        handleConversationClick(conversation.conversationId)
                      }
                    >
                      <div className="flex items-start gap-2">
                        <ChatCircle
                          size={12}
                          className="mt-0.5 flex-shrink-0 text-gray-400"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-800 font-medium truncate">
                            {getConversationTitle(conversation)}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {dayjs(conversation.lastMessageTime).fromNow()} •{" "}
                            {conversation.messageCount} tin nhắn
                          </div>
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <button
                            className="p-1 rounded hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateTitle(
                                conversation.conversationId,
                                getConversationTitle(conversation)
                              );
                            }}
                            disabled={updateConversationTitleMutation.isPending}
                          >
                            <PencilSimple size={10} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-gray-500">
                  Chưa có lịch sử hội thoại nào
                  <br />
                  <span className="text-gray-400">
                    Hãy bắt đầu trò chuyện đầu tiên!
                  </span>
                </div>
              )}

              {/* Debug info - remove in production */}
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-500">
                Debug: {conversations.length} cuộc hội thoại | Loading:{" "}
                {isLoadingConversations ? "Yes" : "No"}
              </div>
            </div>
          </div>

          {/* Footer - User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="from-green-500 to-blue-500 flex size-10 items-center justify-center rounded-full bg-gradient-to-r text-sm font-medium text-white">
                <User size={20} weight="fill" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-800">
                  {(() => {
                    // Import chatService to check current user
                    const user =
                      typeof window !== "undefined"
                        ? JSON.parse(localStorage.getItem("profile") || "null")
                        : null;

                    if (user && user.id) {
                      return `Người dùng #${user.id}`;
                    }

                    // Check guest ID
                    const guestId =
                      typeof window !== "undefined"
                        ? localStorage.getItem("guestId")
                        : null;

                    return guestId ? `Khách: ${guestId.slice(-8)}` : "Thí sinh";
                  })()}
                </div>
                <div className="text-xs text-gray-500">
                  {(() => {
                    const user =
                      typeof window !== "undefined"
                        ? JSON.parse(localStorage.getItem("profile") || "null")
                        : null;
                    return user && user.id
                      ? "Đã đăng nhập"
                      : "Đang tư vấn tuyển sinh";
                  })()}
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
        <AdmissionPredictor onClose={() => setShowPredictor(false)} />
      )}

      {showCampusTour && (
        <CampusTour
          onClose={() => setShowCampusTour(false)}
          onSubmit={() => sendMessage({})}
        />
      )}
    </>
  );
}

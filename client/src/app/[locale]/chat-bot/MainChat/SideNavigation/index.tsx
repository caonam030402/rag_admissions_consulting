"use client";

import "dayjs/locale/vi";

import { Button, Divider } from "@heroui/react";
import {
  Books,
  Calculator,
  ChartBar,
  ChatCircle,
  Clock,
  Gear,
  GraduationCap,
  House,
  LightbulbFilament,
  MapTrifold,
  PencilSimple,
  Plus,
  Trash,
  User,
  X,
} from "@phosphor-icons/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

import { ENameLocalS } from "@/constants";
import useChatBot from "@/hooks/features/chatbot/useChatBot";
import { chatService } from "@/services/chat";
import { useChatStore } from "@/stores/chat";
import { formatSurveyData } from "@/utils/common";

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

  // React Query hooks for chat history using chatService
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = chatService.useConversations();

  const updateConversationTitleMutation =
    chatService.useUpdateConversationTitle();
  const deleteConversationMutation = chatService.useDeleteConversation();

  // Extract conversations array from paginated data
  const conversations = conversationsData?.data || [];

  // Zustand store for current conversation tracking
  const {
    currentConversationId,
    startNewConversation,
    loadConversation,
    clearMessages,
    replaceMessages,
  } = useChatStore();

  // Load conversation history when currentConversationId changes
  const { data: conversationHistoryData } = chatService.useConversationHistory(
    currentConversationId,
  );

  // Extract messages array from paginated data
  const conversationMessages = conversationHistoryData?.data || [];

  // Use ref to track last processed messages to avoid infinite loop
  const lastProcessedMessages = useRef<string>("");

  // Restore current conversation from localStorage on mount
  useEffect(() => {
    const savedConversationId = localStorage.getItem(
      ENameLocalS.CURRENT_CONVERSATION_ID,
    );
    if (savedConversationId && savedConversationId !== currentConversationId) {
      loadConversation(savedConversationId);
    }
  }, []); // Run only on mount

  // Update messages in store when conversation history loads
  useEffect(() => {
    if (conversationMessages.length > 0 && currentConversationId) {
      // Create a hash of current messages to compare
      const messagesHash = conversationMessages
        .map((msg: any) => msg.id)
        .join(",");

      // Only update if messages have actually changed
      if (messagesHash !== lastProcessedMessages.current) {
        lastProcessedMessages.current = messagesHash;
        replaceMessages(currentConversationId, conversationMessages);
      }
    } else if (currentConversationId && conversationMessages.length === 0) {
      // Clear messages when switching to empty conversation
      const currentMessages = useChatStore.getState().messages;
      if (currentMessages.length > 0) {
        clearMessages();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationMessages, currentConversationId]);

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
      localStorage.setItem(ENameLocalS.CURRENT_CONVERSATION_ID, conversationId);
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

  const handleDeleteConversation = (conversationId: string) => {
    // Use window.confirm to satisfy linter
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác.",
      )
    ) {
      deleteConversationMutation.mutate(conversationId);

      // If deleting current conversation, start a new one
      if (conversationId === currentConversationId) {
        handleNewChat();
      }
    }
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

  const renderLoadingState = () => (
    <div className="space-y-2">
      {/* Loading skeleton */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-start gap-2 p-2">
            <div className="mt-0.5 size-3 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="mb-1 h-3 w-3/4 rounded bg-gray-200" />
              <div className="h-2 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderConversationsList = () => (
    <div className="max-h-64 space-y-1 overflow-y-auto">
      {conversations.slice(0, 10).map((conversation: any) => (
        <motion.div
          key={conversation.conversationId}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`group relative cursor-pointer rounded p-2 text-xs transition-colors hover:bg-gray-50 ${
            currentConversationId === conversation.conversationId
              ? "border-l-2 border-blue-500 bg-blue-50"
              : ""
          }`}
          onClick={() => handleConversationClick(conversation.conversationId)}
        >
          <div className="flex items-start gap-2">
            <ChatCircle size={12} className="mt-0.5 shrink-0 text-gray-400" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-gray-800">
                {getConversationTitle(conversation)}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {dayjs(conversation.lastMessageTime).fromNow()} •{" "}
                {conversation.messageCount} tin nhắn
              </div>
            </div>
          </div>

          {/* Hover Actions */}
          <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex gap-1">
              <button
                type="button"
                className="rounded p-1 text-blue-600 hover:bg-gray-200 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateTitle(
                    conversation.conversationId,
                    getConversationTitle(conversation),
                  );
                }}
                disabled={updateConversationTitleMutation.isPending}
                title="Đổi tên cuộc trò chuyện"
                aria-label="Đổi tên cuộc trò chuyện"
              >
                <PencilSimple size={10} />
              </button>
              <button
                type="button"
                className="rounded p-1 text-red-600 hover:bg-red-200 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conversation.conversationId);
                }}
                disabled={deleteConversationMutation.isPending}
                title="Xóa cuộc trò chuyện"
                aria-label="Xóa cuộc trò chuyện"
              >
                <Trash size={10} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="p-3 text-center text-xs text-gray-500">
      <div className="mb-2">
        <ChatCircle size={32} className="mx-auto text-gray-300" />
      </div>
      <div className="font-medium">Chưa có lịch sử hội thoại</div>
      <div className="mt-1 text-gray-400">Hãy bắt đầu trò chuyện đầu tiên!</div>
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
          <div className="scroll flex-1 space-y-2 overflow-y-auto p-4">
            {/* New Chat Button */}
            <div className="mb-4">
              <Button
                className="from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 w-full justify-start bg-gradient-to-r text-white"
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
              InformationResources,
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
                {conversations.length > 0 && (
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600">
                    {conversations.length}
                  </span>
                )}
              </div>

              {conversationsError && (
                <div className="rounded-lg bg-red-50 p-3 text-center text-xs text-red-500">
                  <div className="font-medium">Lỗi tải dữ liệu</div>
                  <div className="mt-1 text-gray-600">
                    {conversationsError instanceof Error
                      ? conversationsError.message
                      : "Không thể tải lịch sử hội thoại"}
                  </div>
                </div>
              )}

              {isLoadingConversations
                ? renderLoadingState()
                : conversations.length > 0
                  ? renderConversationsList()
                  : renderEmptyState()}
            </div>
          </div>

          {/* Footer - User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="from-green-500 to-blue-500 flex size-10 items-center justify-center rounded-full bg-gradient-to-r text-sm font-medium text-white">
                <User size={20} weight="fill" />
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

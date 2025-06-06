"use client";

import "dayjs/locale/vi";

import { ChatCircle, Clock, Trash } from "@phosphor-icons/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";

import { ENameLocalS } from "@/constants";
import { chatService } from "@/services/chat";
import { useChatStore } from "@/stores/chat";

// Setup dayjs
dayjs.extend(relativeTime);
dayjs.locale("vi");

interface ConversationHistoryProps {
  onConversationSelect: (conversationId: string) => void;
}

export default function ConversationHistory({
  onConversationSelect,
}: ConversationHistoryProps) {
  const { data: conversations, isLoading } = chatService.useConversations(
    1,
    10,
  );
  const { loadConversation, currentConversationId } = useChatStore();
  const deleteConversationMutation = chatService.useDeleteConversation();

  const handleConversationClick = (conversationId: string) => {
    localStorage.setItem(ENameLocalS.CURRENT_CONVERSATION_ID, conversationId);
    loadConversation(conversationId);
    onConversationSelect(conversationId);
  };

  const handleDeleteConversation = async (
    e: React.MouseEvent,
    conversationId: string,
  ) => {
    e.stopPropagation();
    try {
      await deleteConversationMutation.mutateAsync(conversationId);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-lg bg-blue-100">
            <ChatCircle size={14} className="text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-800">
            Lịch sử chat
          </span>
        </div>
        <div className="flex-1 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!conversations?.data || conversations.data.length === 0) {
    return (
      <div className="flex h-full flex-col bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-lg bg-blue-100">
            <ChatCircle size={14} className="text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-800">
            Lịch sử chat
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
                <ChatCircle size={20} className="text-gray-400" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">
              Chưa có lịch sử
            </div>
            <div className="text-xs text-gray-400">Bắt đầu chat đầu tiên</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-lg bg-blue-100">
          <ChatCircle size={12} className="text-blue-600" />
        </div>
        <span className="text-sm font-semibold text-gray-800">
          Lịch sử chat
        </span>
        <div className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {conversations.data.length}
        </div>
      </div>

      {/* Conversation list */}
      <div className="max-h-48 scroll">
        <div className="space-y-1.5">
          {conversations.data.slice(0, 5).map((conversation) => (
            <button
              key={conversation.conversationId}
              type="button"
              onClick={() =>
                handleConversationClick(conversation.conversationId)
              }
              className={`group relative w-full rounded-lg border p-2 text-left transition-colors ${
                currentConversationId === conversation.conversationId
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <ChatCircle size={10} weight="fill" className="text-blue-600" />
                </div>

                <div className="min-w-0 flex-1">
                  {/* Title */}
                  <div className="truncate text-xs font-semibold text-gray-900">
                    {conversation.title || "Cuộc hội thoại mới"}
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={8} />
                    <span>{dayjs(conversation.lastMessageTime).fromNow()}</span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) =>
                    handleDeleteConversation(e, conversation.conversationId)
                  }
                  className="shrink-0 rounded-lg p-1 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  disabled={deleteConversationMutation.isPending}
                  aria-label="Xóa cuộc hội thoại"
                >
                  <Trash size={10} />
                </button>
              </div>

              {/* Active indicator */}
              {currentConversationId === conversation.conversationId && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

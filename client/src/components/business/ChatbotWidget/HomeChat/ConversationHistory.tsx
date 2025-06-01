"use client";

import "dayjs/locale/vi";

import { Card, CardBody } from "@heroui/react";
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
  const { data: conversations, isLoading } = chatService.useConversations(1, 5);
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
      <div className="flex min-h-0 flex-1 flex-col px-3 py-2">
        <div className="mb-2 flex items-center gap-2">
          <ChatCircle size={14} className="text-gray-600" />
          <span className="text-xs font-medium text-gray-700">Lịch sử</span>
        </div>
        <div className="min-h-0 flex-1 space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!conversations?.data || conversations.data.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-3 py-2">
        <div className="mb-2 flex items-center gap-2">
          <ChatCircle size={14} className="text-gray-600" />
          <span className="text-xs font-medium text-gray-700">Lịch sử</span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-xs text-gray-400">Chưa có hội thoại</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 py-2">
      {/* Header */}
      <div className="mb-2 flex shrink-0 items-center gap-2">
        <ChatCircle size={14} className="text-gray-600" />
        <span className="text-xs font-medium text-gray-700">Lịch sử</span>
        <span className="text-[10px] text-gray-400">
          ({conversations.data.length})
        </span>
      </div>

      {/* Scrollable conversation list */}
      <div className="min-h-0 flex-1 scroll">
        <div className="space-y-1.5 pr-1">
          {conversations.data.slice(0, 5).map((conversation) => (
            <Card
              key={conversation.conversationId}
              isPressable
              onPress={() =>
                handleConversationClick(conversation.conversationId)
              }
              className={`w-full ${
                currentConversationId === conversation.conversationId
                  ? "border border-blue-400 bg-blue-50"
                  : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <CardBody className="p-2.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    {/* Title */}
                    <div className="mb-1 truncate text-xs font-medium text-gray-900">
                      {conversation.title || "Cuộc hội thoại mới"}
                    </div>

                    {/* Last message */}
                    <div className="mb-1.5 line-clamp-1 text-[10px] text-gray-600">
                      {conversation.lastMessage || "Chưa có tin nhắn"}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock size={10} />
                      <span>
                        {dayjs(conversation.lastMessageTime).fromNow()}
                      </span>
                      <span>•</span>
                      <span>{conversation.messageCount}</span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) =>
                      handleDeleteConversation(e, conversation.conversationId)
                    }
                    className="shrink-0 rounded p-1 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    disabled={deleteConversationMutation.isPending}
                    aria-label="Xóa cuộc hội thoại"
                  >
                    <Trash size={12} />
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { humanHandoffService } from "@/services/humanHandoff";
import { userService } from "@/services/user";

export default function AdminChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user } = userService.useProfile();
  const sendAdminMessage = humanHandoffService.useSendAdminMessage();
  const endMutation = humanHandoffService.useEndHandoff();

  useEffect(() => {
    // Get admin ID for socket connection
    const adminId = user?.id || 1;

    // Connect to socket as admin
    humanHandoffService.connectSocket(undefined, adminId);

    // Setup socket listeners for real-time messages
    const cleanup = humanHandoffService.setupSocketListeners({
      onSupportEnded: () => {
        toast.success("Phiên hỗ trợ đã kết thúc");
        setTimeout(() => window.close(), 1000);
      },

      onUserMessage: (data) => {
        // User sent a message to admin
        const newMsg = {
          id: Date.now().toString(),
          content: data.message,
          role: "user",
          timestamp: new Date(data.timestamp),
        };
        setMessages((prev) => [...prev, newMsg]);
      },
    });

    // Initialize with session data (you might want to fetch this from API)
    setSessionInfo({
      name: "User", // You can fetch real session data here
      email: "user@example.com",
      sessionId,
      conversationId: "conversation-id", // This should come from session data
    });

    // Add welcome message
    setMessages([
      {
        id: "welcome",
        content: "Chào bạn! Tôi sẵn sàng hỗ trợ bạn về tuyển sinh.",
        role: "admin",
        timestamp: new Date(),
      },
    ]);

    toast.success("Đã kết nối với người dùng!");

    return () => {
      cleanup();
      humanHandoffService.disconnectSocket();
    };
  }, [sessionId, user?.id]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !sessionInfo) return;

    setIsLoading(true);

    // Add message to chat locally first for immediate feedback
    const newMsg = {
      id: Date.now().toString(),
      content: newMessage,
      role: "admin",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    const messageToSend = newMessage;
    setNewMessage("");

    // Send message via API and socket
    sendAdminMessage.mutate(
      {
        sessionId,
        conversationId: sessionInfo.conversationId,
        message: messageToSend,
        adminName: user?.fullName || user?.firstName || "Admin",
      },
      {
        onSuccess: () => {
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
          // Remove message from local state if failed
          setMessages((prev) => prev.filter((msg) => msg.id !== newMsg.id));
          setNewMessage(messageToSend); // Restore message
          toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");
        },
      }
    );
  };

  const handleEndSession = () => {
    if (!sessionId) return;

    endMutation.mutate(sessionId, {
      onSuccess: () => {
        toast.success("Đã kết thúc phiên hỗ trợ!");
        setTimeout(() => {
          window.close(); // Close popup window
        }, 1000);
      },
      onError: () => {
        toast.error("Không thể kết thúc phiên. Vui lòng thử lại.");
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar name={sessionInfo?.name || "User"} size="sm" />
          <div>
            <h3 className="text-lg font-semibold">
              {sessionInfo?.name || "Guest User"}
            </h3>
            <div className="flex items-center gap-2">
              <div className="size-2 animate-pulse rounded-full bg-success-500" />
              <span className="text-sm text-gray-500">Đang online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="success" variant="flat">
            🟢 Đang kết nối
          </Badge>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onClick={handleEndSession}
            isLoading={endMutation.isPending}
          >
            Kết thúc
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-white p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "admin" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.role === "admin"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="mb-1 text-xs opacity-70">
                {message.role === "admin" ? "Admin" : "User"}
              </div>
              <p>{message.content}</p>
              <div
                className={`mt-2 text-xs ${
                  message.role === "admin" ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            color="primary"
            onClick={handleSendMessage}
            isLoading={isLoading || sendAdminMessage.isPending}
            disabled={!newMessage.trim()}
          >
            Gửi
          </Button>
        </div>
      </div>
    </div>
  );
}

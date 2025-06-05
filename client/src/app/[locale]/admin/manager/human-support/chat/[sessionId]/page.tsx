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

  const [userInfo, setUserInfo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user } = userService.useProfile();
  const sendMessageMutation = humanHandoffService.useSendMessage();

  useEffect(() => {
    // Setup socket listeners for real-time messages
    const cleanup = humanHandoffService.setupSocketListeners({
      onSupportAccepted: () => {},
      onSupportEnded: () => {
        toast.success("Phiên hỗ trợ đã kết thúc");
        setTimeout(() => window.close(), 1000);
      },
      onSupportTimeout: () => {
        toast.error("Phiên hỗ trợ đã hết thời gian");
        setTimeout(() => window.close(), 1000);
      },
      onAdminNotification: () => {},
      onUserMessage: (data) => {
        // User sent a message to admin
        const newMsg = {
          id: Date.now().toString(),
          content: data.message,
          role: "user",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMsg]);
        toast.success("Tin nhắn mới từ người dùng");
      },
    });

    // Initialize with sample data for now
    setUserInfo({
      name: "John Doe",
      email: "john@example.com",
      sessionId,
    });

    setMessages([
      {
        id: "1",
        content: "Chào admin, tôi cần hỗ trợ về tuyển sinh",
        role: "user",
        timestamp: new Date(),
      },
    ]);

    toast.success("Đã kết nối với người dùng!");

    return cleanup;
  }, [sessionId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);

    // Add message to chat locally
    const newMsg = {
      id: Date.now().toString(),
      content: newMessage,
      role: "admin",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    const messageToSend = newMessage;
    setNewMessage("");

    // Send message via API
    sendMessageMutation.mutate({
      sessionId,
      message: messageToSend,
      senderType: "admin",
      adminId: user?.id,
      adminName: user?.fullName || user?.firstName || "Admin",
    }, {
      onSuccess: () => {
        setIsLoading(false);
        toast.success("Tin nhắn đã được gửi");
      },
      onError: () => {
        setIsLoading(false);
        // Remove message from local state if failed
        setMessages((prev) => prev.filter(msg => msg.id !== newMsg.id));
        setNewMessage(messageToSend); // Restore message
      },
    });
  };

  const handleEndSession = () => {
    toast.success("Đã kết thúc phiên hỗ trợ!");
    setTimeout(() => {
      window.close(); // Close popup window
    }, 1000);
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
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar name={userInfo?.name || "User"} size="sm" />
          <div>
            <h3 className="text-lg font-semibold">
              {userInfo?.name || "Guest User"}
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
            onPress={handleEndSession}
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
            variant="bordered"
            size="lg"
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="lg"
            color="primary"
            onPress={handleSendMessage}
            isLoading={isLoading}
            disabled={!newMessage.trim()}
          >
            Gửi
          </Button>
        </div>

        <div className="mt-2 text-center text-xs text-gray-500">
          Session ID: {sessionId}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import {
  ChatCircle,
  CheckCircle,
  Clock,
  Phone,
  Users,
  X,
} from "@phosphor-icons/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { humanHandoffService } from "@/services/humanHandoff";

interface PendingRequest {
  id: string;
  conversationId: string;
  userProfile?: {
    name?: string;
    email?: string;
  };
  initialMessage: string;
  requestedAt: Date;
  timeElapsed: number;
}

interface ActiveSession {
  id: string;
  conversationId: string;
  userProfile?: {
    name?: string;
    email?: string;
  };
  connectedAt: Date;
  duration: number;
}

export default function HumanSupportPage() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Queries with more frequent updates for real-time feel
  const { data: notifications, refetch: refetchNotifications } =
    humanHandoffService.useAdminNotifications();
  const { data: sessions, refetch: refetchSessions } =
    humanHandoffService.useAdminSessions();

  // Mutations
  const acceptMutation = humanHandoffService.useAcceptHandoff();
  const endMutation = humanHandoffService.useEndHandoff();

  // Aggressive auto refresh every 2 seconds for real-time experience
  useEffect(() => {
    const interval = setInterval(() => {
      refetchNotifications();
      refetchSessions();
      setLastUpdate(Date.now());
    }, 2000);

    return () => clearInterval(interval);
  }, [refetchNotifications, refetchSessions]);

  // Handle accepting a request
  const handleAcceptRequest = async (sessionId: string) => {
    acceptMutation.mutate(sessionId, {
      onSuccess: () => {
        // Immediate refresh after action
        refetchNotifications();
        refetchSessions();
        toast.success("Đã nhận yêu cầu hỗ trợ! Bạn có thể bắt đầu chat.");
      },
    });
  };

  // Handle ending a session
  const handleEndSession = async (sessionId: string) => {
    endMutation.mutate(sessionId, {
      onSuccess: () => {
        refetchSessions();
        toast.success("Đã kết thúc phiên hỗ trợ!");
      },
    });
  };

  // Handle opening chat (simplified - just open in new tab)
  const handleOpenChat = (session: ActiveSession) => {
    const chatUrl = `/admin/manager/human-support/chat/${session.id}`;
    window.open(chatUrl, "_blank", "width=800,height=600");
    toast.success("Mở cửa sổ chat trong tab mới");
  };

  // Process notifications into pending requests
  useEffect(() => {
    if (notifications) {
      const pending = notifications
        .filter((session) => session.status === "waiting")
        .map((session) => ({
          id: session.id,
          conversationId: session.conversationId,
          userProfile: session.userProfile,
          initialMessage: session.initialMessage,
          requestedAt: session.requestedAt,
          timeElapsed: Math.floor(
            (Date.now() - new Date(session.requestedAt).getTime()) / 1000,
          ),
        }));
      setPendingRequests(pending);
    }
  }, [notifications]);

  // Process sessions into active sessions
  useEffect(() => {
    if (sessions) {
      const active = sessions
        .filter((session) => session.status === "connected")
        .map((session) => ({
          id: session.id,
          conversationId: session.conversationId,
          userProfile: session.userProfile,
          connectedAt: session.connectedAt!,
          duration: Math.floor(
            (Date.now() - new Date(session.connectedAt!).getTime()) / 1000,
          ),
        }));
      setActiveSessions(active);
    }
  }, [sessions]);

  // Enhanced Socket setup for real-time updates
  useEffect(() => {
    const cleanup = humanHandoffService.setupSocketListeners({
      onSupportAccepted: () => {
        refetchNotifications();
        refetchSessions();
        toast.success("Có admin khác đã nhận yêu cầu!");
      },
      onSupportEnded: () => {
        refetchSessions();
        toast("Một phiên hỗ trợ đã kết thúc", { icon: 'ℹ️' });
      },
      onSupportTimeout: () => {
        refetchNotifications();
        toast("Một yêu cầu hỗ trợ đã timeout", { icon: "⚠️" });
      },
      onAdminNotification: (notification: any) => {
        // Force immediate refetch when new request comes in
        refetchNotifications();
        refetchSessions();
        
        // Show prominent notification
        toast.success(
          `🔔 YÊU CẦU MỚI: ${notification.userProfile?.name || "User"} cần hỗ trợ!`,
          {
            duration: 8000,
            style: {
              background: '#10B981',
              color: 'white',
              fontWeight: 'bold',
            },
          },
        );
      },
    });

    setIsLoading(false);
    return cleanup;
  }, [refetchNotifications, refetchSessions]);

  // Format time duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Render pending request card
  const renderPendingRequest = (request: PendingRequest) => (
    <Card key={request.id} className="mb-4 border-l-4 border-l-warning hover:shadow-lg transition-all">
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar
              name={request.userProfile?.name || "Guest"}
              size="sm"
              className="flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">
                  {request.userProfile?.name || "Guest User"}
                </h4>
                <Badge color="warning" size="sm" className="animate-pulse">
                  🔔 Đang chờ
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {request.userProfile?.email || "No email"}
              </p>
              <p className="mt-2 text-sm bg-gray-50 p-2 rounded italic">
                &ldquo;{request.initialMessage}&rdquo;
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-red-600 font-medium">
                <Clock size={14} />
                Đã chờ {formatDuration(request.timeElapsed)} ⏰
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              startContent={<CheckCircle size={16} />}
              onPress={() => handleAcceptRequest(request.id)}
              isLoading={acceptMutation.isPending}
              className="animate-pulse"
            >
              NHẬN NGAY
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // Render active session card
  const renderActiveSession = (session: ActiveSession) => (
    <Card key={session.id} className="mb-4 border-l-4 border-l-success hover:shadow-lg transition-all">
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar
              name={session.userProfile?.name || "Guest"}
              size="sm"
              className="flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">
                  {session.userProfile?.name || "Guest User"}
                </h4>
                <Badge color="success" size="sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-success-500 animate-ping" />
                    ✅ Đang kết nối
                  </div>
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {session.userProfile?.email || "No email"}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-green-600 font-medium">
                <Phone size={14} />
                Thời gian: {formatDuration(session.duration)} 📞
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<ChatCircle size={16} />}
              onPress={() => handleOpenChat(session)}
            >
              💬 Chat
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<X size={16} />}
              onPress={() => handleEndSession(session.id)}
              isLoading={endMutation.isPending}
            >
              Kết thúc
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
          <p>Đang tải dữ liệu real-time...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] space-y-4">
      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Human Support Dashboard
            </h1>
            <p className="mt-2 text-gray-500">
              Quản lý hỗ trợ trực tiếp với người dùng (Real-time)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Cập nhật cuối: {new Date(lastUpdate).toLocaleTimeString("vi-VN")}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {pendingRequests.length}
              </div>
              <div className="text-sm text-gray-500">🔔 Đang chờ</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {activeSessions.length}
              </div>
              <div className="text-sm text-gray-500">✅ Đang kết nối</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="rounded-lg bg-white shadow-sm border">
        <Tabs aria-label="Human support tabs" className="p-4">
          <Tab
            key="pending"
            title={
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>🔔 Yêu cầu chờ</span>
                {pendingRequests.length > 0 && (
                  <Badge color="warning" size="sm" className="animate-bounce">
                    {pendingRequests.length}
                  </Badge>
                )}
              </div>
            }
          >
            <div className="mt-4">
              {pendingRequests.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <ChatCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Không có yêu cầu hỗ trợ nào đang chờ</p>
                  <p className="text-sm mt-2">
                    🔄 Trang sẽ tự động cập nhật mỗi 2 giây khi có yêu cầu mới
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    <span>Đang lắng nghe real-time...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-orange-600 font-medium mb-4">
                    ⚠️ Có {pendingRequests.length} yêu cầu cần xử lý ngay!
                  </div>
                  {pendingRequests.map(renderPendingRequest)}
                </div>
              )}
            </div>
          </Tab>

          <Tab
            key="active"
            title={
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>💬 Phiên đang hoạt động</span>
                {activeSessions.length > 0 && (
                  <Badge color="success" size="sm">
                    {activeSessions.length}
                  </Badge>
                )}
              </div>
            }
          >
            <div className="mt-4">
              {activeSessions.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Không có phiên hỗ trợ nào đang hoạt động</p>
                  <p className="text-sm mt-2">
                    👆 Nhận yêu cầu từ tab "Yêu cầu chờ" để bắt đầu hỗ trợ
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-green-600 font-medium mb-4">
                    ✅ Đang hỗ trợ {activeSessions.length} người dùng
                  </div>
                  {activeSessions.map(renderActiveSession)}
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
} 
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

  // Get current admin ID (you might need to adjust this based on your auth system)
  const adminId = 1; // TODO: Get from auth context

  // Queries with optimized refresh
  const { data: notifications, refetch: refetchNotifications } =
    humanHandoffService.useAdminNotifications();
  const { data: sessions, refetch: refetchSessions } =
    humanHandoffService.useAdminSessions();

  // Mutations
  const acceptMutation = humanHandoffService.useAcceptHandoff();
  const endMutation = humanHandoffService.useEndHandoff();

  // Optimized refresh - every 3 seconds instead of 2
  useEffect(() => {
    const interval = setInterval(() => {
      refetchNotifications();
      refetchSessions();
      setLastUpdate(Date.now());
    }, 3000);

    return () => clearInterval(interval);
  }, [refetchNotifications, refetchSessions]);

  // Handle accepting a request
  const handleAcceptRequest = async (sessionId: string) => {
    acceptMutation.mutate(sessionId, {
      onSuccess: () => {
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
            (Date.now() - new Date(session.requestedAt).getTime()) / 1000
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
            (Date.now() - new Date(session.connectedAt!).getTime()) / 1000
          ),
        }));
      setActiveSessions(active);
    }
  }, [sessions]);

  // Enhanced Socket setup for real-time updates
  useEffect(() => {
    // Connect as admin
    humanHandoffService.connectSocket(undefined, adminId);

    const cleanup = humanHandoffService.setupSocketListeners({
      onAdminNotification: (notification: any) => {
        console.log("🔔 Admin received notification:", notification);

        // Force immediate refetch when new request comes in
        refetchNotifications();
        refetchSessions();

        // Show prominent notification
        toast.success(
          `🔔 YÊU CẦU MỚI: ${notification.userProfile?.name || "User"} cần hỗ trợ!`,
          {
            duration: 8000,
            style: {
              background: "#10B981",
              color: "white",
              fontWeight: "bold",
            },
          }
        );
      },

      onSupportAccepted: () => {
        console.log("✅ Admin saw support accepted");
        refetchNotifications();
        refetchSessions();
        toast.success("Có admin khác đã nhận yêu cầu!");
      },

      onSupportEnded: () => {
        console.log("❌ Admin saw support ended");
        refetchSessions();
        toast("Một phiên hỗ trợ đã kết thúc", { icon: "ℹ️" });
      },

      onUserMessage: (data) => {
        console.log("📨 Admin received user message:", data);

        // Prevent duplicate notifications with a simple debounce
        const messageKey = `${data.conversationId}-${data.message}-${Date.now()}`;
        const lastNotification = sessionStorage.getItem(
          "lastMessageNotification"
        );

        if (lastNotification !== messageKey) {
          sessionStorage.setItem("lastMessageNotification", messageKey);

          // Show notification for new user messages
          toast(
            `📨 Tin nhắn mới từ cuộc hội thoại ${data.conversationId.slice(-8)}`,
            {
              duration: 5000,
              style: {
                background: "#3B82F6",
                color: "white",
              },
            }
          );
        }
      },
    });

    setIsLoading(false);

    return () => {
      console.log("🧹 Cleaning up admin socket listeners");
      cleanup();
      humanHandoffService.disconnectSocket();
    };
  }, [refetchNotifications, refetchSessions, adminId]);

  // Format time duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Render pending request card
  const renderPendingRequest = (request: PendingRequest) => (
    <Card
      key={request.id}
      className="mb-4 border-l-4 border-l-warning hover:shadow-lg transition-all"
    >
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
                  {formatDuration(request.timeElapsed)}
                </Badge>
              </div>
              {request.userProfile?.email && (
                <p className="text-sm text-gray-600">
                  {request.userProfile.email}
                </p>
              )}
              <div className="mt-2">
                <p className="text-sm text-gray-700 line-clamp-2">
                  "{request.initialMessage}"
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Clock size={12} />
                <span>
                  Yêu cầu lúc{" "}
                  {new Date(request.requestedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              color="success"
              variant="flat"
              startContent={<CheckCircle size={16} />}
              onClick={() => handleAcceptRequest(request.id)}
              isLoading={acceptMutation.isPending}
            >
              Nhận
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // Render active session card
  const renderActiveSession = (session: ActiveSession) => (
    <Card
      key={session.id}
      className="mb-4 border-l-4 border-l-success hover:shadow-lg transition-all"
    >
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
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {formatDuration(session.duration)}
                  </div>
                </Badge>
              </div>
              {session.userProfile?.email && (
                <p className="text-sm text-gray-600">
                  {session.userProfile.email}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Phone size={12} />
                <span>
                  Kết nối lúc{" "}
                  {new Date(session.connectedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<ChatCircle size={16} />}
              onClick={() => handleOpenChat(session)}
            >
              Chat
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<X size={16} />}
              onClick={() => handleEndSession(session.id)}
              isLoading={endMutation.isPending}
            >
              Kết thúc
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hỗ trợ trực tiếp</h1>
          <p className="text-gray-600">
            Quản lý các yêu cầu hỗ trợ và phiên chat trực tiếp
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>
            Cập nhật lần cuối: {new Date(lastUpdate).toLocaleTimeString()}
          </span>
          {isLoading && <Badge color="warning">Đang tải...</Badge>}
        </div>
      </div>

      <Tabs aria-label="Support tabs" className="w-full">
        <Tab
          key="pending"
          title={
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Chờ xử lý</span>
              {pendingRequests.length > 0 && (
                <Badge color="warning" size="sm">
                  {pendingRequests.length}
                </Badge>
              )}
            </div>
          }
        >
          <div className="mt-6">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Không có yêu cầu chờ xử lý
                  </h3>
                  <p className="text-gray-500">
                    Tất cả yêu cầu hỗ trợ đã được xử lý hoặc chưa có yêu cầu nào
                    mới.
                  </p>
                </CardBody>
              </Card>
            ) : (
              <div>{pendingRequests.map(renderPendingRequest)}</div>
            )}
          </div>
        </Tab>

        <Tab
          key="active"
          title={
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>Đang hoạt động</span>
              {activeSessions.length > 0 && (
                <Badge color="success" size="sm">
                  {activeSessions.length}
                </Badge>
              )}
            </div>
          }
        >
          <div className="mt-6">
            {activeSessions.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Không có phiên chat đang hoạt động
                  </h3>
                  <p className="text-gray-500">
                    Hiện tại không có phiên hỗ trợ trực tiếp nào đang diễn ra.
                  </p>
                </CardBody>
              </Card>
            ) : (
              <div>{activeSessions.map(renderActiveSession)}</div>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

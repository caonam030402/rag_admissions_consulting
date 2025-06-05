import { Badge, Button, Card, CardBody, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Bell, Clock, MessageSquare, User, UserCheck } from "lucide-react";

import { humanHandoffService } from "@/services/humanHandoff";
import type { AdminNotification, HumanHandoffSession } from "@/services/humanHandoff";

export default function HumanHandoffManager() {
  // Queries and mutations
  const { data: notifications, refetch } = humanHandoffService.useAdminNotifications();
  const { data: sessions } = humanHandoffService.useAdminSessions();
  const acceptMutation = humanHandoffService.useAcceptHandoff();
  const endMutation = humanHandoffService.useEndHandoff();

  // Socket listeners for real-time updates
  useEffect(() => {
    const cleanup = humanHandoffService.setupSocketListeners({
      onSupportAccepted: () => {
        refetch();
      },
      onSupportEnded: () => {
        refetch();
      },
      onSupportTimeout: () => {
        refetch();
      },
      onAdminNotification: (notification: AdminNotification) => {
        refetch();
        toast.success(
          `Yêu cầu hỗ trợ mới từ ${notification.userProfile?.name || "khách"}`,
          {
            icon: "🔔",
          }
        );
      },
    });

    return cleanup;
  }, [refetch]);

  const handleAcceptRequest = (sessionId: string) => {
    acceptMutation.mutate(sessionId);
  };

  const handleEndSession = (sessionId: string) => {
    endMutation.mutate(sessionId);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "warning";
      case "connected":
        return "success";
      case "ended":
        return "default";
      case "timeout":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "Đang chờ";
      case "connected":
        return "Đã kết nối";
      case "ended":
        return "Đã kết thúc";
      case "timeout":
        return "Hết thời gian";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý hỗ trợ trực tiếp</h1>
        <Badge color="primary" variant="flat">
          {notifications?.length || 0} yêu cầu chờ
        </Badge>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-warning-600" />
            <h2 className="text-lg font-semibold">Yêu cầu chờ xử lý</h2>
          </div>
        </CardHeader>
        <CardBody>
          {notifications && notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.sessionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg border border-warning-200 bg-warning-50 p-4 dark:bg-warning-100/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-warning-600" />
                        <span className="font-medium">
                          {notification.userProfile?.name || "Khách hàng"}
                        </span>
                        {notification.userProfile?.email && (
                          <span className="text-sm text-gray-500">
                            ({notification.userProfile.email})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="size-3" />
                        <span>
                          Yêu cầu lúc {formatTime(notification.requestedAt)}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MessageSquare className="size-4 text-gray-500" />
                        <p className="text-sm">{notification.initialMessage}</p>
                      </div>
                    </div>
                    <Button
                      color="success"
                      onPress={() => handleAcceptRequest(notification.sessionId)}
                      isLoading={acceptMutation.isPending}
                      startContent={<UserCheck size={16} />}
                    >
                      Nhận hỗ trợ
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Bell className="mx-auto mb-2 size-8 opacity-50" />
              <p>Không có yêu cầu hỗ trợ nào</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* All Sessions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Lịch sử phiên hỗ trợ</h2>
        </CardHeader>
        <CardBody>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      color={getStatusColor(session.status)}
                      variant="flat"
                      size="sm"
                    >
                      {getStatusText(session.status)}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {session.userProfile?.name || `Cuộc hỗ trợ ${session.id.slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatTime(session.requestedAt)}
                      </p>
                    </div>
                  </div>
                  {session.status === "connected" && (
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => handleEndSession(session.id)}
                      isLoading={endMutation.isPending}
                    >
                      Kết thúc
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <MessageSquare className="mx-auto mb-2 size-8 opacity-50" />
              <p>Chưa có phiên hỗ trợ nào</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
} 
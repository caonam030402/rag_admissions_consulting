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
        // toast.success("Support request accepted! You can start chatting.");
      },
    });
  };

  // Handle ending a session
  const handleEndSession = async (sessionId: string) => {
    endMutation.mutate(sessionId, {
      onSuccess: () => {
        refetchSessions();
        // toast.success("Support session ended!");
      },
    });
  };

  // Handle opening chat (simplified - just open in new tab)
  const handleOpenChat = (session: ActiveSession) => {
    const chatUrl = `/admin/manager/human-support/chat/${session.id}`;
    window.open(chatUrl, "_blank", "width=800,height=600");
    toast.success("Chat window opened in new tab");
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
          `🔔 NEW REQUEST: ${notification.userProfile?.name || "User"} needs support!`,
          {
            duration: 8000,
            style: {
              background: "#10B981",
              color: "white",
              fontWeight: "bold",
            },
          },
        );
      },

      onSupportAccepted: () => {
        console.log("✅ Admin saw support accepted");
        refetchNotifications();
        refetchSessions();
        // toast.success("Another admin has accepted the request!");
      },

      onSupportEnded: () => {
        console.log("❌ Admin saw support ended");
        refetchSessions();
        // toast("A support session has ended", { icon: "ℹ️" });
      },

      onUserMessage: (data) => {
        console.log("📨 Admin received user message:", data);

        // Prevent duplicate notifications with a simple debounce
        const messageKey = `${data.conversationId}-${data.message}-${Date.now()}`;
        const lastNotification = sessionStorage.getItem(
          "lastMessageNotification",
        );

        if (lastNotification !== messageKey) {
          sessionStorage.setItem("lastMessageNotification", messageKey);

          // Show notification for new user messages
          toast(
            `📨 New message from conversation ${data.conversationId.slice(-8)}`,
            {
              duration: 5000,
              style: {
                background: "#3B82F6",
                color: "white",
              },
            },
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
      className="mb-4 border-l-4 border-l-warning transition-all hover:shadow-lg"
    >
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar
              name={request.userProfile?.name || "Guest"}
              size="sm"
              className="shrink-0"
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
                <p className="line-clamp-2 text-sm text-gray-700">
                  &ldquo;{request.initialMessage}&rdquo;
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Clock size={12} />
                <span>
                  Requested at{" "}
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
              Accept
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
      className="mb-4 border-l-4 border-l-success transition-all hover:shadow-lg"
    >
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar
              name={session.userProfile?.name || "Guest"}
              size="sm"
              className="shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">
                  {session.userProfile?.name || "Guest User"}
                </h4>
                <Badge color="success" size="sm">
                  <div className="flex items-center gap-1">
                    <div className="size-2 animate-pulse rounded-full bg-green-500" />
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
                  Connected at{" "}
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
              End
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="mx-auto">
      <Tabs aria-label="Support tabs" className="w-full">
        <Tab
          key="pending"
          title={
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Pending</span>
              {pendingRequests.length > 0 && (
                <Badge color="warning" size="sm">
                  {pendingRequests.length}
                </Badge>
              )}
            </div>
          }
        >
          <div className="mt-2">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardBody className="py-12 text-center">
                  <Clock size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-700">
                    No pending requests
                  </h3>
                  <p className="text-gray-500">
                    All support requests have been processed or there are no new requests yet.
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
              <span>Active</span>
              {activeSessions.length > 0 && (
                <Badge color="success" size="sm">
                  {activeSessions.length}
                </Badge>
              )}
            </div>
          }
        >
          <div className="mt-2">
            {activeSessions.length === 0 ? (
              <Card>
                <CardBody className="py-12 text-center">
                  <Users size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-700">
                    No active chat sessions
                  </h3>
                  <p className="text-gray-500">
                    There are currently no live support sessions in progress.
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

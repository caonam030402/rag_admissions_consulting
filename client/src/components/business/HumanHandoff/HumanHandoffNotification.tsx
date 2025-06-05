import { Badge } from "@heroui/badge";
import { Bell } from "@phosphor-icons/react";
import { useRouter } from "next-nprogress-bar";
import React, { useEffect, useState } from "react";

import { PATH } from "@/constants";
import { humanHandoffService } from "@/services/humanHandoff";

export default function HumanHandoffNotification() {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  const { data: notifications } = humanHandoffService.useAdminNotifications();

  useEffect(() => {
    if (notifications) {
      const pending = notifications.filter(
        (session) => session.status === "waiting",
      );
      setPendingCount(pending.length);
    }
  }, [notifications]);

  const handleClick = () => {
    router.push(PATH.HUMAN_SUPPORT);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  if (pendingCount === 0) {
    return null;
  }

  return (
    <button
      type="button"
      className="relative cursor-pointer rounded-full p-2 hover:bg-gray-100"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`${pendingCount} pending human support requests`}
    >
      <Bell size={24} className="text-gray-600" />
      <Badge color="danger" size="sm" className="absolute -right-1 -top-1">
        {pendingCount}
      </Badge>
    </button>
  );
}
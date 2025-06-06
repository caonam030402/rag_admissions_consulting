"use client";

import { CaretDown, CaretUp, User, UserCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";

interface HumanHandoffIndicatorProps {
  status?: "waiting" | "connected";
  adminInfo?: {
    name: string;
    avatar?: string;
  };
}

export default function HumanHandoffIndicator({
  status = "waiting",
  adminInfo,
}: HumanHandoffIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isConnected = status === "connected";

  return (
    <div className="relative z-10 mx-4 mb-2">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm"
      >
        {/* Compact header - always visible */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center gap-3 p-3 transition-colors hover:bg-orange-100/50"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-100">
            {isConnected ? (
              <UserCircle size={16} weight="fill" className="text-orange-600" />
            ) : (
              <User size={16} className="text-orange-600" />
            )}
          </div>

          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-orange-800">
              {isConnected
                ? `${adminInfo?.name || "Admin"} đang hỗ trợ`
                : "Đang chuyển tới admin"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`size-2 rounded-full ${
                isConnected
                  ? "bg-green-500 animate-pulse"
                  : "bg-orange-500 animate-pulse"
              }`}
            />
            {isExpanded ? (
              <CaretUp size={16} className="text-orange-600" />
            ) : (
              <CaretDown size={16} className="text-orange-600" />
            )}
          </div>
        </button>

        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-orange-200/50"
            >
              <div className="p-3 pt-2">
                {isConnected ? (
                  <div className="space-y-2">
                    <p className="text-xs text-orange-700">
                      ✅ Bạn đã được kết nối với admin. Họ sẽ hỗ trợ bạn trong
                      thời gian thực.
                    </p>
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-2">
                      <div className="size-2 rounded-full bg-green-500" />
                      <span className="text-xs font-medium text-green-700">
                        Đang hoạt động
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-orange-700">
                      ⏳ Đang tìm admin có sẵn để hỗ trợ bạn. Vui lòng chờ trong
                      giây lát...
                    </p>
                    <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-2">
                      <div className="size-2 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-xs font-medium text-orange-700">
                        Đang chờ
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 
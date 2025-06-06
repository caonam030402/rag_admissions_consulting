import { Badge, Button, Progress } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, ChevronDown, Clock, UserCheck, X } from "lucide-react";
import React, { useState } from "react";

interface HumanHandoffIndicatorProps {
  isWaiting: boolean;
  isConnected: boolean;
  adminName?: string;
  timeoutRemaining: number;
  onEndHandoff: () => void;
}

export default function HumanHandoffIndicator({
  isWaiting,
  isConnected,
  adminName,
  timeoutRemaining,
  onEndHandoff,
}: HumanHandoffIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isWaiting && !isConnected) {
    return null;
  }

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    return `${seconds}s`;
  };

  const getProgressValue = (): number => {
    if (!isWaiting) return 100;
    return ((60000 - timeoutRemaining) / 60000) * 100;
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Compact header for collapsed state
  const renderCompactHeader = () => {
    if (isWaiting) {
      return (
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="shrink-0"
          >
            <Clock className="size-3.5 text-orange-500" />
          </motion.div>
          <span className="text-xs font-medium text-gray-700">
            Đang chờ hỗ trợ
          </span>
          <span className="text-xs font-medium text-gray-700">
            {formatTime(timeoutRemaining)}
          </span>
        </div>
      );
    }

    if (isConnected) {
      return (
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="size-2 shrink-0 rounded-full bg-green-500"
          />
          <span className="truncate text-xs font-medium text-gray-700">
            {adminName ? `${adminName} đang hỗ trợ` : "Đang hỗ trợ trực tiếp"}
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="m-2"
      >
        {/* Compact Header - Always visible */}
        <motion.div
          className={`
            cursor-pointer rounded-lg border px-3 py-2 
            transition-all duration-200 hover:shadow-sm
            ${
              isWaiting
                ? "border-orange-200 bg-orange-50 hover:bg-orange-100"
                : "border-green-200 bg-green-50 hover:bg-green-100"
            }
            ${!isExpanded ? "" : "rounded-b-none"}
          `}
          onClick={toggleExpanded}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            {renderCompactHeader()}
            <div className="flex shrink-0 items-center gap-1">
              {isConnected && (
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  isIconOnly
                  onClick={(e) => {
                    e.stopPropagation();
                    onEndHandoff();
                  }}
                  className="size-6 min-w-0 hover:bg-red-100"
                >
                  <X size={12} />
                </Button>
              )}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                className="p-1"
              >
                <ChevronDown className="size-3 text-gray-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {isWaiting && (
                <div className="rounded-b-lg border border-t-0 border-orange-200 bg-white p-3">
                  <div className="space-y-3">
                    {/* Main status */}
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Clock className="size-4 text-orange-500" />
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          Đang kết nối với cán bộ tư vấn
                        </p>
                        <p className="text-xs text-gray-600">
                          Thời gian còn lại: {formatTime(timeoutRemaining)}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <Progress
                        value={getProgressValue()}
                        color="warning"
                        size="sm"
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Đang tìm kiếm...</span>
                        <span>{formatTime(timeoutRemaining)} / 60s</span>
                      </div>
                    </div>

                    {/* Info note */}
                    <div className="rounded-md border border-orange-100 bg-orange-50 p-2">
                      <p className="text-xs text-orange-700">
                        💡 Bạn có thể tiếp tục chat trong lúc chờ đợi
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isConnected && (
                <div className="rounded-b-lg border border-t-0 border-green-200 bg-white p-3">
                  <div className="space-y-3">
                    {/* Connected status */}
                    <div className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          Đã kết nối thành công!
                        </p>
                        <p className="text-xs text-gray-600">
                          Bạn đang chat trực tiếp với cán bộ tư vấn
                        </p>
                      </div>
                    </div>

                    {/* Admin info */}
                    <div className="flex items-center gap-2 rounded-md border border-green-100 bg-green-50 p-2">
                      <UserCheck className="size-3.5 shrink-0 text-green-600" />
                      <span className="flex-1 truncate text-sm font-medium text-green-800">
                        {adminName || "Cán bộ tư vấn"}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="size-2 rounded-full bg-green-500"
                        />
                        <span className="text-xs text-green-600">Online</span>
                      </div>
                    </div>

                    {/* Help note */}
                    <div className="rounded-md border border-blue-100 bg-blue-50 p-2">
                      <p className="text-xs text-blue-700">
                        ℹ️ Cán bộ sẽ giải đáp mọi thắc mắc về tuyển sinh
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

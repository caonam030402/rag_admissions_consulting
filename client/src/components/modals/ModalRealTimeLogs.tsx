"use client";

import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
} from "@heroui/react";
import React, { useEffect, useRef } from "react";

import type { ProcessingLogMessage } from "@/hooks/useDataSourceWebSocket";

interface ModalRealTimeLogsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dataSourceId: string;
  dataSourceName: string;
  logs: ProcessingLogMessage[];
  isConnected: boolean;
  onClearAllLogs?: () => void;
}

export default function ModalRealTimeLogs({
  isOpen,
  onOpenChange,
  dataSourceId,
  dataSourceName,
  logs,
  isConnected,
  onClearAllLogs,
}: ModalRealTimeLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Get latest progress
  const latestLog = logs[logs.length - 1];
  const progress = latestLog?.progress || 0;

  // Get level color
  const getLevelColor = (
    level: string,
  ): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    switch (level) {
      case "success":
        return "success";
      case "error":
        return "danger";
      case "warning":
        return "warning";
      case "info":
        return "primary";
      default:
        return "default";
    }
  };

  // Get level icon
  const getLevelIcon = (level: string) => {
    switch (level) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📝";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[80vh]",
        body: "py-4",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">
                  Real-time Processing Logs
                </h3>
                <Chip size="sm" variant="flat" color="primary">
                  {dataSourceName}
                </Chip>
                <div className="flex items-center gap-2">
                  <div
                    className={`size-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm text-gray-600">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </ModalHeader>

            <ModalBody>
              {/* Progress Bar */}
              {progress > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{progress}%</span>
                  </div>
                  <Progress
                    value={progress}
                    color={progress === 100 ? "success" : "primary"}
                    className="w-full"
                  />
                </div>
              )}

              {/* Logs Container */}
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <div className="text-center">
                      <div className="mb-2 text-4xl">📝</div>
                      <p>No logs yet...</p>
                      <p className="text-sm">
                        Processing logs will appear here in real-time
                      </p>
                    </div>
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={`${log.timestamp}-${index}`}
                      className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                    >
                      <div className="shrink-0">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getLevelColor(log.level)}
                          className="min-w-16"
                        >
                          <span className="flex items-center gap-1">
                            <span>{getLevelIcon(log.level)}</span>
                            <span className="text-xs uppercase">
                              {log.level}
                            </span>
                          </span>
                        </Chip>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {log.message}
                          </p>
                          {log.progress !== undefined && (
                            <span className="ml-2 text-xs text-gray-500">
                              {log.progress}%
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          {log.step && (
                            <Chip size="sm" variant="flat" color="default">
                              {log.step}
                            </Chip>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </ModalBody>

            <ModalFooter>
              <div className="flex w-full items-center justify-between">
                <div className="text-sm text-gray-500">
                  {logs.length} log{logs.length !== 1 ? "s" : ""} • Updated{" "}
                  {latestLog
                    ? new Date(latestLog.timestamp).toLocaleTimeString()
                    : "Never"}
                </div>
                <div className="flex items-center gap-2">
                  {onClearAllLogs && logs.length > 0 && (
                    <Button
                      color="danger"
                      variant="light"
                      size="sm"
                      onPress={onClearAllLogs}
                    >
                      Clear All Logs
                    </Button>
                  )}
                  <Button color="primary" onPress={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

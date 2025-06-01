import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { cn } from "@/libs/utils";
import type { TabTypeChatbotWidget } from "@/types/chat";

import HomeChat from "./HomeChat";
import MainChat from "./MainChat";

interface ChatWidgetProps {
  isOpen: boolean;
  activeTab: TabTypeChatbotWidget;
  handleTabSwitch: (tab: TabTypeChatbotWidget) => void;
  isOnScreen?: boolean;
  styles?: {
    shadow?:
      | "shadow-none"
      | "shadow-sm"
      | "shadow-md"
      | "shadow-lg"
      | "shadow-xl"
      | "shadow-2xl"
      | "shadow-3xl";
    height?: "h-full" | "h-[75vh]";
  };
  isTransition?: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  activeTab,
  handleTabSwitch,
  isOnScreen = true,
  styles = {
    shadow: "shadow-xl",
    height: "h-[75vh]",
  },
  isTransition = true,
}) => {
  const propsTransition = isTransition
    ? {
        initial: { opacity: 0, scale: 0.8, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.8, y: 20 },
        transition: { duration: 0.3, ease: "easeOut" },
      }
    : {};
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "w-[380px] overflow-hidden rounded-3xl bg-white shadow-xl",
            styles?.shadow,
            {
              "fixed bottom-24 right-6 z-40": isOnScreen,
            },
          )}
          {...propsTransition}
        >
          <div className="relative h-full">
            {activeTab === "home" ? (
              <div className={cn("h-full bg-gray-50", styles?.height)}>
                <HomeChat onTabChange={handleTabSwitch} />
              </div>
            ) : (
              <div className={cn("h-full bg-gray-50", styles?.height)}>
                <MainChat handleTabSwitch={handleTabSwitch} />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

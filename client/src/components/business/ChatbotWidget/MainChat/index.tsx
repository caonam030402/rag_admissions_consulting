import { motion } from "framer-motion";
import React from "react";

import type { TabTypeChatbotWidget } from "@/types/chat";

import Body from "./Body";
import ChatEnter from "./ChatEnter";
import Header from "./Header";

export default function MainChat({
  checkEmailHasSaved,
  handleTabSwitch,
  isTransition = true,
}: {
  checkEmailHasSaved: () => void;
  handleTabSwitch: (tab: TabTypeChatbotWidget) => void;
  isTransition?: boolean;
}) {
  const propsTransition = isTransition
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.2 },
      }
    : {};
  return (
    <motion.div {...propsTransition} className="flex h-full flex-col">
      <Header handleTabSwitch={handleTabSwitch} />
      <div className="scroll h-full flex-1">
        <Body />
      </div>
      <ChatEnter checkEmailHasSaved={checkEmailHasSaved} />
    </motion.div>
  );
}

import { motion } from "framer-motion";
import React from "react";

import type { TabTypeChatbotWidget } from "../types";
import Body from "./Body";
import ChatEnter from "./ChatEnter";
import Header from "./Header";

export default function MainChat({
  checkEmailHasSaved,
  handleTabSwitch,
}: {
  checkEmailHasSaved: () => void;
  handleTabSwitch: (tab: TabTypeChatbotWidget) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex h-full flex-col"
    >
      <Header handleTabSwitch={handleTabSwitch} />
      <div className="scroll h-full flex-1">
        <Body />
      </div>
      <ChatEnter checkEmailHasSaved={checkEmailHasSaved} />
    </motion.div>
  );
}

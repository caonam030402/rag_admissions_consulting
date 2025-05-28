import { AnimatePresence, motion } from "framer-motion";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import EmailForm from "./EmailForm";
import HomeChat from "./HomeChat";
import MainChat from "./MainChat";
import type { TabTypeChatbotWidget } from "./types";

interface ChatWidgetProps {
  isOpen: boolean;
  activeTab: TabTypeChatbotWidget;
  showEmailForm: boolean;
  setShowEmailForm: Dispatch<SetStateAction<boolean>>;
  handleTabSwitch: (tab: TabTypeChatbotWidget) => void;
  checkEmailHasSaved: () => boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  activeTab,
  showEmailForm,
  setShowEmailForm,
  handleTabSwitch,
  checkEmailHasSaved,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-24 right-6 z-40 w-[350px] overflow-hidden rounded-3xl bg-white shadow-2xl"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="relative">
            {activeTab === "home" ? (
              <div className="h-[75vh] bg-gray-50">
                <HomeChat onTabChange={handleTabSwitch} />
              </div>
            ) : (
              <div className="h-[75vh] bg-gray-50">
                <MainChat
                  checkEmailHasSaved={checkEmailHasSaved}
                  handleTabSwitch={handleTabSwitch}
                />
              </div>
            )}

            <EmailForm
              showEmailForm={showEmailForm}
              setShowEmailForm={setShowEmailForm}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

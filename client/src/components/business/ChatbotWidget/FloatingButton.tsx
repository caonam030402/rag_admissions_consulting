import { Button } from "@heroui/react";
import { ChatCircle, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

interface FloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  isOpen,
  onClick,
}) => {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
    >
      <Button
        isIconOnly
        radius="full"
        size="lg"
        className="size-14 bg-blue-500 text-white shadow-2xl hover:bg-blue-600"
        onClick={onClick}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
};

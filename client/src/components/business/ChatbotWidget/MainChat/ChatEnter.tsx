import { PaperPlaneRight } from "@phosphor-icons/react";
import React from "react";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import useChatBot from "@/hooks/features/chatbot/useChatBot";

export default function ChatEnter({
  checkEmailHasSaved,
}: {
  checkEmailHasSaved: () => void;
}) {
  const { sendMessage, inputRef, message, setMessage } = useChatBot();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage({ callback: checkEmailHasSaved });
    }
  };

  return (
    <div className="p-4">
      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        // disabled={isTyping}
        classNames={{
          inputWrapper: "pr-0 border",
        }}
        placeholder="Write a message..."
        size="md"
        endContent={
          <Button isIconOnly variant="light">
            <PaperPlaneRight size={20} />
          </Button>
        }
      />
      <p className="mt-2 text-center text-[10px] text-gray-500">
        Powered by <span className="font-bold">CaoNam</span>
      </p>
    </div>
  );
}

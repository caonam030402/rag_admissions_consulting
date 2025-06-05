import { PaperPlaneRight } from "@phosphor-icons/react";
import React from "react";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import useChatBot from "@/hooks/features/chatbot/useChatBot";
import { useHumanHandoff } from "@/hooks/useHumanHandoff";
import { humanHandoffService } from "@/services/humanHandoff";
import { useChatStore } from "@/stores/chat";

export default function ChatEnter() {
  const { sendMessage, inputRef, message, setMessage } = useChatBot();
  const { isTyping, currentConversationId } = useChatStore();

  // Human handoff hook
  const { isConnected } = useHumanHandoff({
    conversationId: currentConversationId,
  });

  // Send user message mutation for human handoff
  const sendUserMessage = humanHandoffService.useSendUserMessage();

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // If in human handoff session, send to admin
    if (isConnected && currentConversationId) {
      sendUserMessage.mutate({
        conversationId: currentConversationId,
        message: message.trim(),
      });

      // Clear the input after sending
      setMessage("");
      return;
    }

    // Normal chatbot flow
    sendMessage({});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isLoading = isTyping || sendUserMessage.isPending;
  const placeholder = isConnected
    ? "Nhắn tin với cán bộ tư vấn..."
    : "Hỏi tôi về tuyển sinh, ngành học, học phí...";

  return (
    <div className="p-4">
      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={isLoading}
        classNames={{
          inputWrapper: "pr-0 border",
        }}
        placeholder={placeholder}
        size="md"
        endContent={
          <Button
            isIconOnly
            variant="light"
            onPress={handleSendMessage}
            isDisabled={isLoading || !message.trim()}
          >
            <PaperPlaneRight size={20} />
          </Button>
        }
      />
      {isConnected && (
        <p className="mt-1 text-center text-[10px] text-blue-600">
          💬 Đang kết nối với cán bộ tư vấn
        </p>
      )}
      <p className="mt-2 text-center text-[10px] text-gray-500">
        Powered by <span className="font-bold">CaoNam</span>
      </p>
    </div>
  );
}

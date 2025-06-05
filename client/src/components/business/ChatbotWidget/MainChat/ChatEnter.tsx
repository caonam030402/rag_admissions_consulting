import { PaperPlaneRight } from "@phosphor-icons/react";
import React from "react";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { ActorType } from "@/enums/systemChat";
import useChatBot from "@/hooks/features/chatbot/useChatBot";
import { humanHandoffService } from "@/services/humanHandoff";
import { useChatStore } from "@/stores/chat";
import { useHumanHandoff } from "@/hooks/useHumanHandoff";

interface ChatEnterProps {
  humanHandoff: ReturnType<typeof useHumanHandoff>;
}

export default function ChatEnter({ humanHandoff }: ChatEnterProps) {
  const { sendMessage, inputRef, message, setMessage } = useChatBot();
  const { isTyping, currentConversationId, addMessage } = useChatStore();

  const { isConnected, status } = humanHandoff;

  // Send user message mutation for human handoff
  const sendUserMessage = humanHandoffService.useSendUserMessage();

  const handleSendMessage = () => {
    if (!message.trim()) return;

    console.log("📤 ChatEnter - Sending message:", {
      message: message.trim(),
      isConnected,
      currentConversationId,
      status,
    });

    // If in human handoff session, send to admin
    if (isConnected && currentConversationId) {
      console.log("🎯 ChatEnter - Routing to admin");

      const messageText = message.trim();

      // Add user message to chat UI immediately
      addMessage({
        id: Date.now().toString(),
        content: messageText,
        role: ActorType.Human,
        timestamp: Date.now(),
        conversationId: currentConversationId,
      });

      // Clear input immediately for better UX
      setMessage("");

      // Find the admin ID from the session if available
      const adminId = (status as any)?.adminId;

      sendUserMessage.mutate(
        {
          conversationId: currentConversationId,
          message: messageText,
          adminId,
        },
        {
          onSuccess: () => {
            console.log("✅ ChatEnter - Message sent to admin successfully");
          },
          onError: (error) => {
            console.error("❌ ChatEnter - Failed to send to admin:", error);
            // Could potentially remove the message from UI here if needed
          },
        }
      );
      return;
    }

    console.log("🤖 ChatEnter - Routing to bot");
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

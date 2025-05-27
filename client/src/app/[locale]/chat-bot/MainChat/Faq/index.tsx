import { Chip } from "@heroui/react";
import React from "react";
import { v4 as uuidv4 } from "uuid";

import { ActorType } from "@/enums/systemChat";
import { chatService } from "@/services/chat";
import { useChatStore } from "@/stores/chat";

const suggestionQuestions = [
  "Học phí các ngành là bao nhiêu?",
  "Điều kiện xét tuyển như thế nào?",
  "Trường có những ngành đào tạo nào?",
  "Thông tin về học bổng sinh viên giỏi?",
  "Điểm chuẩn năm 2024 là bao nhiêu?",
  "Thủ tục nhập học online như thế nào?",
  "Ký túc xá có những tiện ích gì?",
  "Cơ hội việc làm sau tốt nghiệp?",
];

export default function Faq() {
  const { addMessage, setTyping, setError } = useChatStore();

  const sendMessage = async (messageText: string) => {
    // Add user message to chat
    addMessage({
      id: uuidv4(),
      content: messageText,
      role: ActorType.Human,
      timestamp: Date.now(),
    });

    setTyping(true);

    try {
      // Start a new empty assistant message
      useChatStore.getState().startNewAssistantMessage();

      // Stream the response
      for await (const token of chatService.streamMessage(messageText)) {
        useChatStore.getState().appendToLastMessage(token);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send message",
      );
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-500">Câu hỏi gợi ý:</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestionQuestions.map((question, index) => (
          <Chip
            key={index}
            variant="flat"
            className="cursor-pointer border border-white/20 bg-white/60 text-gray-700 backdrop-blur-sm transition-all hover:bg-white/80 hover:text-gray-900"
            onClick={() => sendMessage(question)}
          >
            {question}
          </Chip>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";

import { useChatStore } from "@/stores/chat";

import ChatMessage from "../ChatMessage";
import IntroChat from "../IntroChat";
import SurveyForm from "../SurveyForm";
import { ActorType } from "@/enums/systemChat";
import { chatService } from "@/services/chat";
import { formatSurveyData } from "@/utils/common";

export default function BodyMainChat() {
  const { messages, isTyping, addMessage, setTyping, setError } =
    useChatStore();
  const [showSurvey, setShowSurvey] = useState(false);

  return (
    <div className="flex-1 scroll h-[80vh]">
      {showSurvey && (
        <SurveyForm
          onSubmit={async (data) => {
            const content = formatSurveyData(data);

            const surveyMessage = {
              id: Date.now().toString(),
              content,
              role: ActorType.Human,
              timestamp: Date.now(),
            };
            setTyping(true);

            addMessage(surveyMessage);
            setShowSurvey(false);
            try {
              useChatStore.getState().startNewAssistantMessage();

              for await (const token of chatService.streamMessage(
                content.trim()
              )) {
                useChatStore.getState().appendToLastMessage(token);
              }
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "Failed to send message"
              );
            } finally {
              setTyping(false);
            }
          }}
          onClose={() => setShowSurvey(false)}
        />
      )}
      {messages.length === 0 ? (
        <div>
          <IntroChat />
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowSurvey(true)}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Khảo sát nghề nghiệp
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && (
            <div className="flex gap-2 p-4">
              <div className="size-2 animate-bounce rounded-full bg-gray-400" />
              <div className="size-2 animate-bounce rounded-full bg-gray-400 delay-100" />
              <div className="size-2 animate-bounce rounded-full bg-gray-400 delay-200" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

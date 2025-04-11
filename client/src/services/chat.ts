import { ChatMessage } from "@/types/chat";
import { ENameLocalS } from "@/constants";

const API_URL = "http://localhost:8000";

export const chatService = {
  async *streamMessage(content: string): AsyncGenerator<string> {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message: content,
          user_email: localStorage.getItem(ENameLocalS.EMAIL),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is null");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const { delta } = JSON.parse(line);
            if (delta) yield delta;
          } catch (e) {
            console.error("Error parsing SSE message:", e);
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
      throw error;
    }
  },

  async sendMessage(content: string): Promise<ChatMessage> {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          user_email: localStorage.getItem(ENameLocalS.EMAIL),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      return {
        id: data.id || Date.now().toString(),
        content: data.content,
        role: "assistant",
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
};

import { ENameLocalS } from "@/constants";
import { ActorType } from "@/enums/systemChat";
import type { ChatMessage } from "@/types/chat";

const API_URL = "http://localhost:8000";

// Base API client service
class ApiService {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }
}

// Chat specific service
class ChatService extends ApiService {
  async *streamMessage(content: string): AsyncGenerator<string> {
    try {
      const response = await this.fetchWithAuth("/chat", {
        method: "POST",
        headers: {
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message: content,
          user_email: localStorage.getItem(ENameLocalS.EMAIL),
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is null");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // Process all lines at once instead of iterating with await in loop
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
  }

  async sendMessage(content: string): Promise<ChatMessage> {
    try {
      const response = await this.fetchWithAuth("/chat", {
        method: "POST",
        body: JSON.stringify({
          message: content,
          user_email: localStorage.getItem(ENameLocalS.EMAIL),
        }),
      });

      const data = await response.json();
      return {
        id: data.id || Date.now().toString(),
        content: data.content,
        role: ActorType.Bot,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService(API_URL);

// Export class for more services if needed
export { ApiService };

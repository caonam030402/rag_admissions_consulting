import { ENameLocalS } from "@/constants";
import { ActorType } from "@/enums/systemChat";
import type { ChatMessage, Conversation } from "@/types/chat";
import { getLocalStorage } from "@/utils/clientStorage";
import { v4 as uuidv4 } from "uuid";

const RAG_API_URL = "http://localhost:8000/api/v1"; // Python RAG API
const NESTJS_API_URL = "http://localhost:5000/api/v1"; // NestJS API

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
  private nestjsService: ApiService;

  constructor() {
    super(RAG_API_URL); // For AI chat
    this.nestjsService = new ApiService(NESTJS_API_URL); // For history
  }

  // Generate guest ID if not exists
  getGuestId(): string {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("guestId", guestId);
    }
    return guestId;
  }

  // Get current user info
  getCurrentUser(): { userId?: number; guestId?: string } {
    const userProfile = getLocalStorage({ key: ENameLocalS.PROFILE }) as any;

    if (userProfile && userProfile.id) {
      return { userId: userProfile.id };
    }

    return { guestId: this.getGuestId() };
  }

  // Get or create current conversation
  getCurrentConversationId(): string {
    let conversationId = localStorage.getItem("currentConversationId");
    if (!conversationId) {
      conversationId = uuidv4();
      localStorage.setItem("currentConversationId", conversationId);
      console.log("Created new conversation:", conversationId);
    }
    return conversationId;
  }

  // Start new conversation
  startNewConversation(): string {
    const conversationId = uuidv4();
    localStorage.setItem("currentConversationId", conversationId);
    console.log("Started new conversation:", conversationId);
    return conversationId;
  }

  // Set current conversation
  setCurrentConversation(conversationId: string): void {
    localStorage.setItem("currentConversationId", conversationId);
    console.log("Switched to conversation:", conversationId);
  }

  async *streamMessage(
    content: string,
    conversationId?: string
  ): AsyncGenerator<string> {
    try {
      const userEmail =
        localStorage.getItem(ENameLocalS.EMAIL) ||
        `guest-${this.getGuestId()}@example.com`;
      const currentConversationId =
        conversationId || this.getCurrentConversationId();

      const requestData = {
        message: content,
        user_email: userEmail,
        conversation_id: currentConversationId,
      };

      console.log("Sending chat request:", requestData);

      const response = await this.fetchWithAuth("/chat", {
        method: "POST",
        headers: {
          Accept: "text/event-stream",
        },
        body: JSON.stringify(requestData),
      });

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
  }

  async sendMessage(
    content: string,
    conversationId?: string
  ): Promise<ChatMessage> {
    try {
      const userEmail =
        localStorage.getItem(ENameLocalS.EMAIL) ||
        `guest-${this.getGuestId()}@example.com`;
      const currentConversationId =
        conversationId || this.getCurrentConversationId();

      const requestData = {
        message: content,
        user_email: userEmail,
        conversation_id: currentConversationId,
      };

      const response = await this.fetchWithAuth("/chat", {
        method: "POST",
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      return {
        id: data.id || Date.now().toString(),
        content: data.content,
        role: ActorType.Bot,
        timestamp: Date.now(),
        conversationId: currentConversationId,
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Chat history methods - Use NestJS API
  async saveMessage(message: ChatMessage): Promise<void> {
    const user = this.getCurrentUser();

    try {
      await this.nestjsService.fetchWithAuth("/chatbots/history", {
        method: "POST",
        body: JSON.stringify({
          ...user,
          role: message.role === ActorType.Human ? "user" : "assistant",
          content: message.content,
          conversationId: message.conversationId,
        }),
      });
      console.log(
        "Message saved to backend:",
        message.content.slice(0, 50) + "..."
      );
    } catch (error) {
      console.error("Error saving message:", error);
    }
  }

  async getConversations(
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: Conversation[]; hasNextPage: boolean }> {
    const user = this.getCurrentUser();

    try {
      const params = new URLSearchParams();
      if (user.userId) {
        params.append("userId", user.userId.toString());
      } else if (user.guestId) {
        params.append("guestId", user.guestId);
      }
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await this.nestjsService.fetchWithAuth(
        `/chatbots/conversations?${params}`
      );
      const data = await response.json();

      return {
        data: data.data.map((conv: any) => ({
          ...conv,
          lastMessageTime: new Date(conv.lastMessageTime),
        })),
        hasNextPage: data.hasNextPage,
      };
    } catch (error) {
      console.error("Error loading conversations:", error);
      return { data: [], hasNextPage: false };
    }
  }

  async getConversationHistory(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: ChatMessage[]; hasNextPage: boolean }> {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await this.nestjsService.fetchWithAuth(
        `/chatbots/conversations/${conversationId}/history?${params}`
      );
      const data = await response.json();

      return {
        data: data.data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role === "user" ? ActorType.Human : ActorType.Bot,
          timestamp: new Date(msg.createdAt).getTime(),
          conversationId: msg.conversationId,
        })),
        hasNextPage: data.hasNextPage,
      };
    } catch (error) {
      console.error("Error loading conversation history:", error);
      return { data: [], hasNextPage: false };
    }
  }

  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<void> {
    try {
      await this.nestjsService.fetchWithAuth(
        `/chatbots/conversations/${conversationId}/title`,
        {
          method: "PUT",
          body: JSON.stringify({ title }),
        }
      );
      console.log("Conversation title updated:", title);
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();

export { ApiService };

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useHumanHandoffService } from "@/services/human-handoff";
import { Message } from "@/types";

const AdminChatPage: React.FC = () => {
  const router = useRouter();
  const humanHandoffService = useHumanHandoffService();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = React.useState("");
  const [adminId, setAdminId] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (!conversationId) return;

    // Load initial conversation data
    setIsLoading(true);

    // Clean up any previous listeners to prevent duplicates
    humanHandoffService.disconnectSocket();

    // Connect as admin
    humanHandoffService.connectSocket(undefined, adminId);

    const cleanup = humanHandoffService.setupSocketListeners({
      onUserMessage: (data) => {
        console.log("📨 Admin received user message in chat:", data);

        // Prevent duplicate messages with unique key check
        const messageId = `user-${data.conversationId}-${data.message}-${data.timestamp}`;
        const existingMessage = messages.find(
          (msg) =>
            msg.content === data.message &&
            msg.sender === "user" &&
            Math.abs(
              new Date(msg.timestamp).getTime() -
                new Date(data.timestamp).getTime()
            ) < 1000
        );

        if (!existingMessage) {
          const userMessage: Message = {
            id: messageId,
            content: data.message,
            sender: "user",
            timestamp: data.timestamp || new Date().toISOString(),
            senderInfo: data.senderInfo,
          };

          setMessages((prev) => [...prev, userMessage]);

          // Auto-scroll to bottom
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      },

      onMessageDelivered: (data) => {
        console.log("✅ Message delivered:", data);
        toast.success("Tin nhắn đã được gửi!");
      },

      onMessageError: (data) => {
        console.log("❌ Message error:", data);
        toast.error("Lỗi gửi tin nhắn!");
      },

      onUserDisconnected: (data) => {
        console.log("👋 User disconnected:", data);
        toast("User đã ngắt kết nối", { icon: "ℹ️" });
      },
    });

    setIsLoading(false);

    return () => {
      console.log("🧹 Cleaning up admin chat socket listeners");
      cleanup();
    };
  }, [conversationId, adminId, messages]); // Remove messages from deps to prevent infinite loop

  return <div>{/* Render your component content here */}</div>;
};

export default AdminChatPage;

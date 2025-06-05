import { Chip, Skeleton } from "@heroui/react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { TRIGGER_CONTACT_CABINET } from "@/constants/common";
import { chatService } from "@/services/chat";

interface ChatSuggestionsProps {
  conversationId: string | null;
  onSuggestionClick: (suggestion: string) => void;
  messagesCount?: number;
  className?: string;
  isHumanHandoffActive?: boolean;
}

export default function ChatSuggestions({
  conversationId,
  onSuggestionClick,
  messagesCount = 0,
  className = "",
  isHumanHandoffActive = false,
}: ChatSuggestionsProps) {
  const { data: suggestionsData, isLoading } = chatService.useChatSuggestions(
    conversationId,
    messagesCount,
  );

  if (!conversationId || isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-blue-500" />
          <span className="text-xs font-medium text-gray-600">Gợi ý</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  const suggestions = suggestionsData?.suggestions || [];

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-2 ${className}`}
    >
      <div className="flex items-center gap-2">
        <Sparkles size={12} className="text-blue-500" />
        <span className="text-xs font-medium text-gray-600">Gợi ý câu hỏi</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => {
          const isHumanHandoffSuggestion =
            suggestion === TRIGGER_CONTACT_CABINET;
          const isDisabled = isHumanHandoffSuggestion && isHumanHandoffActive;

          let chipColor: "default" | "primary" | "success" = "primary";
          if (isHumanHandoffSuggestion) {
            chipColor = isDisabled ? "default" : "success";
          }

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Chip
                variant="flat"
                color={chipColor}
                className={`transition-all hover:scale-105 hover:shadow-sm ${
                  isDisabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={() => {
                  if (!isDisabled) {
                    onSuggestionClick(suggestion);
                  }
                }}
              >
                <span className="text-xs">
                  {isDisabled ? "Đã yêu cầu hỗ trợ" : suggestion}
                </span>
              </Chip>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

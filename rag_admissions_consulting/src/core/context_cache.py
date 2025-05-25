from typing import Dict, Optional
from datetime import datetime, timedelta
from loguru import logger

from core.context_manager import ContextManager


class ContextCache:
    """Cache ContextManager instances theo conversation_id để duy trì ngữ cảnh"""

    _instance: Optional["ContextCache"] = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not ContextCache._initialized:
            self.context_managers: Dict[str, ContextManager] = {}
            self.cache_timeout_minutes = 120  # Cache timeout 2 giờ
            ContextCache._initialized = True
            logger.info("ContextCache initialized")

    def get_or_create_context_manager(
        self, user_id: int, conversation_id: str, user_email: str
    ) -> ContextManager:
        """Lấy hoặc tạo ContextManager cho conversation_id"""

        # Kiểm tra xem đã có ContextManager cho conversation_id này chưa
        if conversation_id in self.context_managers:
            context_manager = self.context_managers[conversation_id]
            logger.info(
                f"Reusing existing ContextManager for conversation: {conversation_id}"
            )
            return context_manager

        # Tạo ContextManager mới
        context_manager = ContextManager(user_id, conversation_id, user_email)
        self.context_managers[conversation_id] = context_manager

        logger.info(f"Created new ContextManager for conversation: {conversation_id}")
        return context_manager

    def remove_context_manager(self, conversation_id: str):
        """Xóa ContextManager khỏi cache"""
        if conversation_id in self.context_managers:
            del self.context_managers[conversation_id]
            logger.info(f"Removed ContextManager for conversation: {conversation_id}")

    def cleanup_expired_contexts(self):
        """Dọn dẹp các ContextManager đã hết hạn"""
        current_time = datetime.now()
        expired_conversations = []

        for conversation_id, context_manager in self.context_managers.items():
            # Kiểm tra tin nhắn cuối cùng
            if context_manager.messages:
                last_message_time = context_manager.messages[-1]["timestamp"]
                if (
                    current_time - last_message_time
                ).total_seconds() > self.cache_timeout_minutes * 60:
                    expired_conversations.append(conversation_id)
            else:
                # Nếu không có tin nhắn nào, xóa luôn
                expired_conversations.append(conversation_id)

        for conversation_id in expired_conversations:
            del self.context_managers[conversation_id]
            logger.info(
                f"Cleaned up expired ContextManager for conversation: {conversation_id}"
            )

        if expired_conversations:
            logger.info(
                f"Cleaned up {len(expired_conversations)} expired ContextManagers"
            )

    def get_cache_stats(self) -> Dict:
        """Lấy thống kê cache"""
        stats = {"total_contexts": len(self.context_managers), "conversations": {}}

        for conversation_id, context_manager in self.context_managers.items():
            context_stats = context_manager.get_context_stats()
            stats["conversations"][conversation_id] = {
                "total_messages": context_stats["total_messages"],
                "user_messages": context_stats["user_messages"],
                "assistant_messages": context_stats["assistant_messages"],
                "oldest_message": (
                    context_stats["oldest_message"].isoformat()
                    if context_stats["oldest_message"]
                    else None
                ),
                "newest_message": (
                    context_stats["newest_message"].isoformat()
                    if context_stats["newest_message"]
                    else None
                ),
            }

        return stats

    def clear_all_contexts(self):
        """Xóa tất cả contexts"""
        self.context_managers.clear()
        logger.info("Cleared all ContextManagers from cache")


# Global instance
context_cache = ContextCache()

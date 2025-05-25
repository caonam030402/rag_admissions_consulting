from typing import List, Dict, Any, Optional
from loguru import logger
import asyncio
from datetime import datetime, timedelta

from shared.enum import RoleType
from shared.chat_history_manager import ChatHistoryManager


class ContextManager:
    """Intelligent context manager for conversation history with backend integration"""

    def __init__(self, user_id: int, conversation_id: str, user_email: str):
        self.user_id = user_id
        self.conversation_id = conversation_id
        self.user_email = user_email
        self.messages: List[Dict[str, Any]] = []
        self.max_context_length = 20  # Maximum messages to keep in context
        self.context_window_minutes = 30  # Context window in minutes

        # Initialize ChatHistoryManager for backend integration (disabled for now)
        # self.history_manager = ChatHistoryManager(user_id, user_email)
        # self.history_manager.set_conversation_id(conversation_id)
        self.history_manager = None  # Disable backend integration temporarily

    async def add_message(self, role: RoleType, content: str):
        """Add a message to the conversation context and save to backend"""
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now(),
            "conversation_id": self.conversation_id,
        }

        self.messages.append(message)
        print(
            f"🔧 DEBUG: Added {role} message to local cache. Total: {len(self.messages)}"
        )

        # Save to backend via ChatHistoryManager (disabled for now)
        if self.history_manager:
            try:
                await asyncio.to_thread(
                    self.history_manager.append_message, role, content
                )
            except Exception as e:
                logger.warning(f"Failed to save message to backend: {e}")
        else:
            logger.debug("Backend integration disabled, using local cache only")

        # Clean old messages if needed
        await self._cleanup_old_messages()

        logger.debug(
            f"Added {role} message to context. Total messages: {len(self.messages)}"
        )

    async def get_context_messages(
        self, limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get recent context messages for the conversation from backend and local cache"""

        # Always try local cache first for immediate availability
        cutoff_time = datetime.now() - timedelta(minutes=self.context_window_minutes)
        local_messages = [
            msg for msg in self.messages if msg["timestamp"] > cutoff_time
        ]

        # Apply limit if specified
        if limit:
            local_messages = local_messages[-limit:]
        else:
            local_messages = local_messages[-self.max_context_length :]

        # If we have local messages, use them
        if local_messages:
            logger.info(f"Using {len(local_messages)} messages from local cache")
            return [
                {
                    "role": msg["role"],
                    "content": msg["content"],
                    "timestamp": msg["timestamp"],
                }
                for msg in local_messages
            ]

        # If no local messages, try backend as fallback (disabled for now)
        if self.history_manager:
            try:
                backend_limit = limit or self.max_context_length
                backend_messages = await asyncio.to_thread(
                    self.history_manager.get_conversation_context, backend_limit
                )

                if backend_messages:
                    logger.info(
                        f"Retrieved {len(backend_messages)} messages from backend"
                    )
                    # Convert to our format with timestamps
                    return [
                        {
                            "role": msg["role"],
                            "content": msg["content"],
                            "timestamp": datetime.now(),  # Use current time as fallback
                        }
                        for msg in backend_messages
                    ]
            except Exception as e:
                logger.warning(f"Backend unavailable, using local cache only: {e}")

        # Return empty if no messages found
        logger.info("No context messages found")
        return []

    async def get_conversation_summary(self) -> str:
        """Generate a summary of the conversation"""
        if not self.messages:
            return "Chưa có cuộc trò chuyện nào."

        user_questions = [
            msg["content"] for msg in self.messages if msg["role"] == RoleType.USER
        ]

        if not user_questions:
            return "Chưa có câu hỏi nào từ người dùng."

        # Create a simple summary
        summary_parts = []
        summary_parts.append(f"Cuộc trò chuyện có {len(self.messages)} tin nhắn")
        summary_parts.append(f"Người dùng đã hỏi {len(user_questions)} câu hỏi")

        # Get main topics from recent questions
        recent_questions = (
            user_questions[-3:] if len(user_questions) > 3 else user_questions
        )
        if recent_questions:
            summary_parts.append("Các chủ đề gần đây:")
            for i, question in enumerate(recent_questions, 1):
                summary_parts.append(f"{i}. {question[:50]}...")

        return "\n".join(summary_parts)

    async def _cleanup_old_messages(self):
        """Remove old messages beyond context window"""
        cutoff_time = datetime.now() - timedelta(
            minutes=self.context_window_minutes * 2
        )

        # Keep messages within extended window
        self.messages = [msg for msg in self.messages if msg["timestamp"] > cutoff_time]

        # Also limit by count
        if len(self.messages) > self.max_context_length * 2:
            self.messages = self.messages[-self.max_context_length * 2 :]

    async def clear_context(self):
        """Clear all conversation context"""
        self.messages.clear()
        logger.info(f"Context cleared for conversation: {self.conversation_id}")

    def get_context_stats(self) -> Dict[str, Any]:
        """Get statistics about the current context"""
        user_messages = sum(1 for msg in self.messages if msg["role"] == RoleType.USER)
        assistant_messages = sum(
            1 for msg in self.messages if msg["role"] == RoleType.ASSISTANT
        )

        return {
            "total_messages": len(self.messages),
            "user_messages": user_messages,
            "assistant_messages": assistant_messages,
            "conversation_id": self.conversation_id,
            "oldest_message": self.messages[0]["timestamp"] if self.messages else None,
            "newest_message": self.messages[-1]["timestamp"] if self.messages else None,
        }

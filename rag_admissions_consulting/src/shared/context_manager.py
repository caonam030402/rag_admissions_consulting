from typing import List, Dict, Any, Optional
from loguru import logger
from .chat_history_db import ChatHistoryManager
from .enum import RoleType


class ConversationContextManager:
    """
    Enhanced context manager that maintains a short-term memory cache
    to improve conversation continuity and context handling.
    """

    def __init__(self, history_manager: ChatHistoryManager, context_window: int = 5):
        """
        Initialize the context manager

        Args:
            history_manager: Underlying chat history manager
            context_window: Number of recent exchanges to maintain in context
        """
        self.history_manager = history_manager
        self.context_window = context_window
        self.short_term_memory = []
        self.last_topics = set()
        logger.info(f"Context manager initialized with window size {context_window}")

    def get_conversation_context(self) -> List[Dict[str, Any]]:
        """
        Get the enhanced conversation context

        Returns:
            List of message dictionaries with role and content
        """
        # Get base context from history manager
        base_context = self.history_manager.get_conversation_context(limit=10)

        # Combine with short-term memory if needed
        if not base_context and self.short_term_memory:
            logger.info("No context from database, using short-term memory")
            return self.short_term_memory

        # Ensure the most recent context is used
        all_messages = base_context.copy()

        # Update short-term memory
        self.short_term_memory = (
            all_messages[-self.context_window :] if all_messages else []
        )

        # Extract topics from recent messages
        self._update_topic_memory(all_messages)

        return all_messages

    def _update_topic_memory(self, messages: List[Dict[str, Any]]):
        """Extract and store topics from recent messages"""
        if not messages:
            return

        # Simple keyword extraction
        education_keywords = [
            "học",
            "ngành",
            "khoa",
            "đại học",
            "cao đẳng",
            "tuyển sinh",
            "điểm",
            "chuyên ngành",
            "học phí",
            "đào tạo",
            "trường",
            "lớp",
            "giảng viên",
            "sinh viên",
            "học bổng",
            "ký túc xá",
            "chứng chỉ",
            "tốt nghiệp",
            "tín chỉ",
            "môn học",
            "điều dưỡng",
            "công nghệ",
            "kinh tế",
        ]

        # Only look at the most recent messages
        recent_msgs = messages[-3:] if len(messages) > 3 else messages

        # Extract topics
        topics = set()
        for msg in recent_msgs:
            content = msg["content"].lower()
            for keyword in education_keywords:
                if keyword in content and keyword not in topics:
                    topics.add(keyword)

        # Update last topics
        if topics:
            self.last_topics = topics
            logger.info(f"Updated conversation topics: {', '.join(topics)}")

    def append_message(self, role: RoleType, content: str):
        """
        Add a message to both database and local context

        Args:
            role: Role of message sender (USER or ASSISTANT)
            content: Message content
        """
        # Add to database through history manager
        self.history_manager.append_message(role, content)

        # Update local short-term memory
        new_msg = {"role": role, "content": content}
        self.short_term_memory.append(new_msg)

        # Keep only the most recent messages
        if len(self.short_term_memory) > self.context_window:
            self.short_term_memory = self.short_term_memory[-self.context_window :]

        # Update topics
        if content:
            self._update_topic_memory([new_msg])

    def get_last_topics(self) -> List[str]:
        """Get the most recent conversation topics"""
        return list(self.last_topics)

    def clear_context(self):
        """Clear the short-term memory context"""
        self.short_term_memory = []
        self.last_topics = set()
        logger.info("Context memory cleared")

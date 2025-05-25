import uuid
from typing import List, Dict, Any, AsyncGenerator, Tuple
from loguru import logger
import asyncio

from core.app_manager import app_manager
from core.context_cache import context_cache
from shared.enum import RoleType


class ChatService:
    """Intelligent chat service with context management and pre-initialized components"""

    def __init__(self, user_id: int, user_email: str, conversation_id: str = None):
        self.user_id = user_id
        self.user_email = user_email
        # Sử dụng conversation_id được cung cấp hoặc tạo mới
        self.conversation_id = conversation_id or str(uuid.uuid4())

        logger.info(
            f"ChatService initialized with conversation_id: {self.conversation_id}"
        )
        print(
            f"🔧 DEBUG: ChatService initialized with conversation_id: {self.conversation_id}"
        )

        # Use pre-initialized components from ApplicationManager
        if app_manager.is_initialized():
            self.rag_engine = app_manager.get_rag_engine()
            logger.info("Using pre-initialized RAG engine")
        else:
            logger.warning(
                "ApplicationManager not initialized, creating new RAG engine"
            )
            from core.rag_engine import RagEngine

            self.rag_engine = RagEngine()

        # Get or create context manager from cache
        logger.info(f"Getting context manager for conversation: {self.conversation_id}")
        self.context_manager = context_cache.get_or_create_context_manager(
            user_id, self.conversation_id, user_email
        )
        logger.info(
            f"Context manager obtained. Total contexts in cache: {len(context_cache.context_managers)}"
        )
        print(
            f"🔧 DEBUG: Context manager obtained. Total contexts in cache: {len(context_cache.context_managers)}"
        )

        logger.info(
            f"Chat service initialized for user {user_email}, conversation: {self.conversation_id}"
        )

    async def process_message_stream(
        self, message: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Process user message and stream response with context awareness"""
        try:
            # Add user message to context
            await self.context_manager.add_message(RoleType.USER, message)

            # Get conversation context for better understanding
            context_messages = await self.context_manager.get_context_messages()

            # Analyze message intent and context
            enhanced_query = await self._enhance_query_with_context(
                message, context_messages
            )

            logger.info(f"Processing enhanced query: {enhanced_query[:100]}...")

            # Generate streaming response
            full_response = ""
            async for token in self.rag_engine.generate_response_stream(
                query=enhanced_query,
                original_query=message,
                context_messages=context_messages,
            ):
                full_response += token
                yield {"delta": token, "conversation_id": self.conversation_id}

            # Add assistant response to context
            await self.context_manager.add_message(RoleType.ASSISTANT, full_response)

            logger.info(f"Response completed for conversation: {self.conversation_id}")

        except Exception as e:
            logger.error(f"Error in process_message_stream: {e}")
            error_message = (
                "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau."
            )

            # Still add to context for continuity
            await self.context_manager.add_message(RoleType.ASSISTANT, error_message)

            yield {"delta": error_message, "conversation_id": self.conversation_id}

    async def _enhance_query_with_context(
        self, current_message: str, context_messages: List[Dict]
    ) -> str:
        """Enhance current query with conversation context for better understanding"""
        if not context_messages:
            return current_message

        # Get recent context (last 3 exchanges)
        recent_context = (
            context_messages[-6:] if len(context_messages) > 6 else context_messages
        )

        # Build context-aware query
        context_summary = []
        for msg in recent_context:
            role = "Người dùng" if msg["role"] == RoleType.USER else "Tư vấn viên"
            context_summary.append(f"{role}: {msg['content'][:100]}...")

        if context_summary:
            enhanced_query = f"""
Ngữ cảnh cuộc trò chuyện gần đây:
{chr(10).join(context_summary)}

Câu hỏi hiện tại: {current_message}

Hãy trả lời câu hỏi hiện tại với sự hiểu biết về ngữ cảnh cuộc trò chuyện trước đó.
"""
            return enhanced_query

        return current_message

    async def get_conversation_summary(self) -> str:
        """Get a summary of the current conversation"""
        return await self.context_manager.get_conversation_summary()

    async def clear_context(self):
        """Clear conversation context"""
        await self.context_manager.clear_context()
        logger.info(f"Context cleared for conversation: {self.conversation_id}")

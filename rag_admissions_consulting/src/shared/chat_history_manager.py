from loguru import logger
import httpx
import asyncio
import uuid
import os
import re
from typing import List, Dict, Any, Optional
from .enum import RoleType

# Cấu hình URL API
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:5000/api/v1")
CHAT_API_URL = f"{API_BASE_URL}/chatbots/history"


class ChatHistoryManager:
    def __init__(self, user_id: int, email: str):
        """Khởi tạo ChatHistoryManager với user_id và email"""
        self.user_id = user_id
        self.email = email
        self.conversation_id = str(uuid.uuid4())

        # Check if this is a guest user (either by email format or user_id = 0)
        self.is_guest = self._is_guest_user(email) or user_id == 0
        self.guest_id = self._extract_guest_id(email) if self.is_guest else None

        logger.info(f"Tạo cuộc hội thoại mới với ID: {self.conversation_id}")
        logger.info(
            f"User type: {'Guest' if self.is_guest else 'Registered'}, Email: {email}, UserID: {user_id}"
        )
        if self.is_guest:
            logger.info(f"Guest ID: {self.guest_id}")
        else:
            logger.info(f"User ID: {self.user_id}")

        # Cache cho tin nhắn trong phiên hiện tại
        self._current_session_messages = []

        # Queue for background message saving
        self._save_queue: List[Dict[str, Any]] = []
        self._processing_queue = False

    def _is_guest_user(self, email: str) -> bool:
        """Kiểm tra xem có phải guest user không"""
        return email.startswith("guest-")

    def _extract_guest_id(self, email: str) -> str:
        """Trích xuất guest ID từ email format: guest-{guestId}@example.com hoặc guest-{guestId}"""
        if self._is_guest_user(email):
            # Extract guest ID from email like "guest-abc123@example.com" or "guest-abc123"
            if "@example.com" in email:
                # Format: guest-abc123@example.com
                match = re.match(r"guest-(.+)@example\.com", email)
                if match:
                    return match.group(1)
            else:
                # Format: guest-abc123 (just remove "guest-" prefix)
                return email[6:]  # Remove "guest-" prefix
        return email  # fallback

    def append_message(self, role: RoleType, content: str) -> None:
        """FAST: Add to cache immediately, save to backend in background"""
        # 1. Add to cache immediately (FAST)
        self._current_session_messages.append({"role": role, "content": content})

        # 2. Queue for background saving (NON-BLOCKING)
        message_data = {
            "role": role.value if hasattr(role, "value") else role,
            "content": content,
            "conversationId": self.conversation_id,
        }

        # Add appropriate user identification
        if self.is_guest:
            message_data["guestId"] = self.guest_id
            logger.info(
                f"🔧 DEBUG: Sending GUEST message: guestId={self.guest_id}, no userId"
            )
        else:
            message_data["userId"] = self.user_id
            logger.info(
                f"🔧 DEBUG: Sending REGISTERED user message: userId={self.user_id}, no guestId"
            )

        # Add to save queue for background processing
        self._save_queue.append(message_data)
        logger.info(f"🔧 DEBUG: Message data queued: {message_data}")

        # Process queue in background (fire-and-forget)
        asyncio.create_task(self._process_save_queue())

        logger.debug(f"Message added to cache and queued for saving: {role}")

    async def _process_save_queue(self):
        """Background task to save messages to backend"""
        if self._processing_queue or not self._save_queue:
            return

        self._processing_queue = True

        try:
            # Process all queued messages
            while self._save_queue:
                message_data = self._save_queue.pop(0)

                try:
                    # Use async HTTP client
                    async with httpx.AsyncClient(timeout=5.0) as client:
                        response = await client.post(CHAT_API_URL, json=message_data)

                        if 200 <= response.status_code < 300:
                            result = response.json()
                            logger.debug(
                                f"Message saved: {result.get('id', 'unknown')}"
                            )
                        else:
                            logger.warning(
                                f"Failed to save message: HTTP {response.status_code}"
                            )

                except Exception as e:
                    logger.warning(f"Error saving message (will retry): {str(e)}")
                    # Could implement retry logic here

        finally:
            self._processing_queue = False

    async def get_conversation_context_async(
        self, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """ASYNC version: Get recent messages from conversation"""
        try:
            # First check local cache (INSTANT)
            if self._current_session_messages:
                cached_messages = [
                    {"role": msg["role"], "content": msg["content"]}
                    for msg in self._current_session_messages[-limit:]
                ]
                logger.debug(f"Using cached messages: {len(cached_messages)}")
                return cached_messages

            # If no cache, try API with timeout
            params = {
                "page": 1,
                "limit": limit,
                "filterByField": "conversationId",
                "filterByValue": self.conversation_id,
                "orderField": "createdAt",
                "orderDirection": "ASC",
            }

            async with httpx.AsyncClient(timeout=3.0) as client:  # Fast timeout
                response = await client.get(CHAT_API_URL, params=params)

                if 200 <= response.status_code < 300:
                    result = response.json()
                    if "data" in result and result["data"]:
                        messages = [
                            {"role": msg["role"], "content": msg["content"]}
                            for msg in result["data"]
                        ]
                        logger.info(f"Retrieved {len(messages)} messages from API")
                        return messages

        except Exception as e:
            logger.debug(f"API unavailable, using cache: {str(e)}")

        # Fallback to current session cache
        return [
            {"role": msg["role"], "content": msg["content"]}
            for msg in self._current_session_messages[-limit:]
        ]

    def get_conversation_context(self, limit: int = 10) -> List[Dict[str, Any]]:
        """SYNC version for backward compatibility - uses cache only for speed"""
        # For performance, only use current session cache
        cached_messages = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in self._current_session_messages[-limit:]
        ]
        logger.debug(f"Fast context retrieval: {len(cached_messages)} messages")
        return cached_messages

    def clear_history(self):
        """Xóa lịch sử chat trong phiên hiện tại"""
        self._current_session_messages = []
        logger.info("Đã xóa lịch sử chat trong phiên hiện tại")

    def get_conversation_id(self) -> str:
        """Lấy conversation ID hiện tại"""
        return self.conversation_id

    def set_conversation_id(self, conversation_id: str):
        """Đặt conversation ID mới (để tiếp tục cuộc trò chuyện cũ)"""
        self.conversation_id = conversation_id
        logger.info(f"Đã đặt conversation ID: {conversation_id}")

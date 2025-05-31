from loguru import logger
import requests
import uuid
import os
import re
from typing import List, Dict, Any
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

        # Check if this is a guest user
        self.is_guest = self._is_guest_user(email)
        self.guest_id = self._extract_guest_id(email) if self.is_guest else None

        logger.info(f"Tạo cuộc hội thoại mới với ID: {self.conversation_id}")
        logger.info(
            f"User type: {'Guest' if self.is_guest else 'Registered'}, Email: {email}"
        )
        if self.is_guest:
            logger.info(f"Guest ID: {self.guest_id}")
        else:
            logger.info(f"User ID: {self.user_id}")

        # Cache cho tin nhắn trong phiên hiện tại
        self._current_session_messages = []

    def _is_guest_user(self, email: str) -> bool:
        """Kiểm tra xem có phải guest user không"""
        return email.startswith("guest-") and email.endswith("@example.com")

    def _extract_guest_id(self, email: str) -> str:
        """Trích xuất guest ID từ email format: guest-{guestId}@example.com"""
        if self._is_guest_user(email):
            # Extract guest ID from email like "guest-abc123@example.com"
            match = re.match(r"guest-(.+)@example\.com", email)
            if match:
                return match.group(1)
        return email  # fallback

    def append_message(self, role: RoleType, content: str) -> None:
        """Lưu tin nhắn qua API và cache trong phiên hiện tại"""
        # Tạo dữ liệu tin nhắn
        message_data = {
            "role": role.value if hasattr(role, "value") else role,
            "content": content,
            "conversationId": self.conversation_id,
        }

        # Add appropriate user identification
        if self.is_guest:
            message_data["guestId"] = self.guest_id
            logger.info(f"Đang lưu tin nhắn {role} cho guest: {self.guest_id}")
        else:
            message_data["userId"] = self.user_id
            logger.info(f"Đang lưu tin nhắn {role} cho user: {self.user_id}")

        # Cache tin nhắn trong phiên hiện tại
        self._current_session_messages.append({"role": role, "content": content})

        # Lưu tin nhắn qua API
        try:
            logger.info(f"API request data: {message_data}")
            response = requests.post(CHAT_API_URL, json=message_data, timeout=10)

            if 200 <= response.status_code < 300:
                result = response.json()
                logger.info(
                    f"Lưu tin nhắn thành công, ID: {result.get('id', 'unknown')}"
                )
            else:
                logger.error(f"Lỗi khi lưu tin nhắn: HTTP {response.status_code}")
                logger.error(f"Chi tiết: {response.text}")
        except Exception as e:
            logger.error(f"Không thể kết nối đến API: {str(e)}")

    def get_conversation_context(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Lấy tin nhắn gần đây của cuộc hội thoại"""
        try:
            # Thử lấy từ API trước
            params = {
                "page": 1,
                "limit": limit,
                "filterByField": "conversationId",
                "filterByValue": self.conversation_id,
                "orderField": "createdAt",
                "orderDirection": "ASC",
            }

            response = requests.get(CHAT_API_URL, params=params, timeout=10)

            if 200 <= response.status_code < 300:
                result = response.json()
                if "data" in result and result["data"]:
                    messages = [
                        {"role": msg["role"], "content": msg["content"]}
                        for msg in result["data"]
                    ]
                    logger.info(f"Lấy được {len(messages)} tin nhắn từ API")
                    return messages

            # Nếu không lấy được từ API, dùng cache của phiên hiện tại
            logger.info("Sử dụng tin nhắn từ phiên hiện tại")
            return [
                {"role": msg["role"], "content": msg["content"]}
                for msg in self._current_session_messages[-limit:]
            ]

        except Exception as e:
            logger.error(f"Lỗi khi lấy tin nhắn: {str(e)}")
            # Trả về tin nhắn từ phiên hiện tại nếu có lỗi
            return [
                {"role": msg["role"], "content": msg["content"]}
                for msg in self._current_session_messages[-limit:]
            ]

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

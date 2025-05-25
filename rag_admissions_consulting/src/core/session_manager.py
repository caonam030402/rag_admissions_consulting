from typing import Dict, Optional
from datetime import datetime, timedelta
import uuid
from loguru import logger


class SessionManager:
    """Quản lý session và conversation_id cho từng user"""

    _instance: Optional["SessionManager"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "initialized"):
            self.user_sessions: Dict[str, Dict] = {}
            self.session_timeout_minutes = 60  # Session timeout 60 phút
            self.initialized = True

    def get_or_create_conversation_id(
        self, user_email: str, provided_conversation_id: str = None
    ) -> str:
        """Lấy hoặc tạo conversation_id cho user"""

        # Nếu client cung cấp conversation_id, sử dụng nó
        if provided_conversation_id:
            self._update_session(user_email, provided_conversation_id)
            logger.info(
                f"Using provided conversation_id: {provided_conversation_id} for user: {user_email}"
            )
            return provided_conversation_id

        # Kiểm tra session hiện tại của user
        current_time = datetime.now()

        if user_email in self.user_sessions:
            session = self.user_sessions[user_email]
            last_activity = session.get("last_activity")

            # Kiểm tra xem session có còn hợp lệ không
            if (
                last_activity
                and (current_time - last_activity).total_seconds()
                < self.session_timeout_minutes * 60
            ):
                # Session còn hợp lệ, sử dụng conversation_id cũ
                conversation_id = session["conversation_id"]
                self._update_session(user_email, conversation_id)
                logger.info(
                    f"Reusing existing conversation_id: {conversation_id} for user: {user_email}"
                )
                return conversation_id

        # Tạo conversation_id mới
        new_conversation_id = str(uuid.uuid4())
        self._update_session(user_email, new_conversation_id)
        logger.info(
            f"Created new conversation_id: {new_conversation_id} for user: {user_email}"
        )
        return new_conversation_id

    def _update_session(self, user_email: str, conversation_id: str):
        """Cập nhật session cho user"""
        self.user_sessions[user_email] = {
            "conversation_id": conversation_id,
            "last_activity": datetime.now(),
        }

    def clear_session(self, user_email: str):
        """Xóa session của user"""
        if user_email in self.user_sessions:
            del self.user_sessions[user_email]
            logger.info(f"Cleared session for user: {user_email}")

    def cleanup_expired_sessions(self):
        """Dọn dẹp các session đã hết hạn"""
        current_time = datetime.now()
        expired_users = []

        for user_email, session in self.user_sessions.items():
            last_activity = session.get("last_activity")
            if (
                last_activity
                and (current_time - last_activity).total_seconds()
                > self.session_timeout_minutes * 60
            ):
                expired_users.append(user_email)

        for user_email in expired_users:
            del self.user_sessions[user_email]
            logger.info(f"Cleaned up expired session for user: {user_email}")

        if expired_users:
            logger.info(f"Cleaned up {len(expired_users)} expired sessions")

    def get_session_info(self, user_email: str) -> Optional[Dict]:
        """Lấy thông tin session của user"""
        return self.user_sessions.get(user_email)

    def get_all_sessions(self) -> Dict:
        """Lấy tất cả sessions (để debug)"""
        return {
            "total_sessions": len(self.user_sessions),
            "sessions": {
                user: {
                    "conversation_id": session["conversation_id"],
                    "last_activity": session["last_activity"].isoformat(),
                    "minutes_since_last_activity": (
                        datetime.now() - session["last_activity"]
                    ).total_seconds()
                    / 60,
                }
                for user, session in self.user_sessions.items()
            },
        }


# Global instance
session_manager = SessionManager()

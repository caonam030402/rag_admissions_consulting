from typing import Dict
from loguru import logger
from shared.database import DatabaseConnection, using_memory_mode


class UserService:
    """Service for handling user operations"""

    def __init__(self):
        self.user_cache: Dict[str, int] = {}

    async def get_or_create_user(self, user_email: str) -> int:
        """Get user ID from email or create new user"""
        # Check cache first
        if user_email in self.user_cache:
            return self.user_cache[user_email]

        # Check if we're in memory mode
        if using_memory_mode:
            user_id = DatabaseConnection.memory_get_or_create_user(user_email)
            self.user_cache[user_email] = user_id
            return user_id

        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            if conn is None:  # We're in memory mode
                user_id = DatabaseConnection.memory_get_or_create_user(user_email)
                self.user_cache[user_email] = user_id
                return user_id

            cur = conn.cursor()

            # Check if user exists
            cur.execute("SELECT id FROM users WHERE email = %s", (user_email,))
            result = cur.fetchone()

            if result:
                user_id = result[0]
                self.user_cache[user_email] = user_id
                return user_id

            # Create new user
            cur.execute(
                "INSERT INTO users (email) VALUES (%s) RETURNING id", (user_email,)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            self.user_cache[user_email] = user_id
            return user_id

        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Error in get_or_create_user: {e}")
            # Use memory mode as fallback
            user_id = DatabaseConnection.memory_get_or_create_user(user_email)
            self.user_cache[user_email] = user_id
            return user_id
        finally:
            if conn:
                DatabaseConnection.return_connection(conn)

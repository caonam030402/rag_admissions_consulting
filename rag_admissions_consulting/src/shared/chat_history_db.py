from loguru import logger
from .database import DatabaseConnection, using_memory_mode
from .enum import RoleType
import uuid
import json
import time
from typing import List, Dict, Any

class ChatHistoryManager:
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.conversation_id = self._get_or_create_conversation()
        self._messages = []
        self._cache_key = f"chat_history:{self.user_id}:{self.conversation_id}"
        self._recent_messages = []
        self._is_fully_loaded = False
        # Don't load messages on initialization to start fresh each time

    def _get_or_create_conversation(self) -> int:
        """Get the most recent conversation or create a new one"""
        if using_memory_mode:
            # Check for existing conversation in memory
            for conv_id, conv_data in DatabaseConnection._memory_conversations.items():
                if conv_data["user_id"] == self.user_id:
                    return conv_id
            
            # Create new conversation in memory
            return DatabaseConnection.memory_create_conversation(self.user_id)
            
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            if conn is None:  # Using memory mode
                return DatabaseConnection.memory_create_conversation(self.user_id)
                
            cur = conn.cursor()
            
            # Get the most recent conversation
            cur.execute(
                "SELECT id FROM conversations WHERE user_id = %s ORDER BY updated_at DESC LIMIT 1",
                (self.user_id,)
            )
            result = cur.fetchone()
            
            if result:
                return result[0]
            
            # Create a new conversation
            cur.execute(
                "INSERT INTO conversations (user_id) VALUES (%s) RETURNING id",
                (self.user_id,)
            )
            conversation_id = cur.fetchone()[0]
            conn.commit()
            return conversation_id
            
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Error getting/creating conversation: {e}")
            # Fallback to memory storage
            return DatabaseConnection.memory_create_conversation(self.user_id)
        finally:
            if conn:
                DatabaseConnection.return_connection(conn)

    def load_recent_messages(self, limit=10):
        """Load only recent messages for the current conversation using optimized batch loading"""
        try:
            # Try to get from cache first with increased TTL
            cached_data = DatabaseConnection.get_cache(self._cache_key)
            if cached_data:
                self._recent_messages = cached_data['value']
                logger.info(f"Loaded {len(self._recent_messages)} messages from cache")
                return

            # Use connection pooling with context manager for automatic cleanup
            conn = DatabaseConnection.get_connection()
            cur = conn.cursor()
            
            if self.user_id:
                # Load only recent messages with optimized query
                query = """
                    SELECT role, content, conversation_id 
                    FROM chat_history 
                    WHERE user_id = %s 
                    ORDER BY timestamp DESC
                    LIMIT %s
                """
                cur.execute(query, (self.user_id, limit))
            else:
                query = """
                    SELECT role, content, conversation_id 
                    FROM chat_history 
                    WHERE conversation_id = %s 
                    ORDER BY timestamp DESC
                    LIMIT %s
                """
                cur.execute(query, (self.conversation_id, limit))
            
            self._recent_messages = []
            for role, content, conv_id in cur.fetchall():
                self._recent_messages.insert(0, {"role": role, "content": content, "conversation_id": conv_id})
            
            # Cache the results with longer TTL for frequently accessed conversations
            DatabaseConnection.set_cache(self._cache_key, self._recent_messages, ttl=1800)  # 30 minutes TTL
            logger.info(f"Loaded {len(self._recent_messages)} recent messages from database")
            
        except Exception as e:
            logger.error(f"Error loading recent messages from database: {e}")
            raise
        finally:
            if conn:
                DatabaseConnection.return_connection(conn)
                
        # Clear expired cache entries periodically
        DatabaseConnection.clear_expired_cache()

    def load_all_messages(self):
        """Load all messages if needed"""
        if self._is_fully_loaded:
            return

        try:
            conn = DatabaseConnection.get_connection()
            cur = conn.cursor()
            
            if self.user_id:
                query = """
                    SELECT role, content, conversation_id 
                    FROM chat_history 
                    WHERE user_id = %s 
                    ORDER BY timestamp ASC
                """
                cur.execute(query, (self.user_id,))
            else:
                query = """
                    SELECT role, content, conversation_id 
                    FROM chat_history 
                    WHERE conversation_id = %s 
                    ORDER BY timestamp ASC
                """
                cur.execute(query, (self.conversation_id,))
            
            self._messages = []
            for role, content, conv_id in cur.fetchall():
                self._messages.append({"role": role, "content": content, "conversation_id": conv_id})
            
            self._is_fully_loaded = True
            logger.info(f"Loaded all {len(self.messages)} messages from database")
            
        except Exception as e:
            logger.error(f"Error loading all messages from database: {e}")
            raise
        finally:
            if conn:
                DatabaseConnection.return_connection(conn)

    def append_message(self, role: RoleType, content: str) -> None:
        """Add a message to the conversation"""
        if using_memory_mode:
            DatabaseConnection.memory_add_message(self.conversation_id, role, content)
            return
            
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            if conn is None:  # Using memory mode
                DatabaseConnection.memory_add_message(self.conversation_id, role, content)
                return
                
            cur = conn.cursor()
            
            # Insert the message
            cur.execute(
                "INSERT INTO messages (conversation_id, role, content) VALUES (%s, %s, %s)",
                (self.conversation_id, role, content)
            )
            
            # Update the conversation's updated_at timestamp
            cur.execute(
                "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (self.conversation_id,)
            )
            
            conn.commit()
            
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Error appending message: {e}")
            # Fallback to memory storage
            DatabaseConnection.memory_add_message(self.conversation_id, role, content)
        finally:
            if conn:
                DatabaseConnection.return_connection(conn)

    def get_conversation_context(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent messages from the conversation"""
        if using_memory_mode:
            messages = DatabaseConnection.memory_get_conversation_messages(self.conversation_id, limit)
            return [
                {
                    "role": msg["role"],
                    "content": msg["content"]
                }
                for msg in messages
            ]
            
        conn = None
        try:
            conn = DatabaseConnection.get_connection()
            if conn is None:  # Using memory mode
                return DatabaseConnection.memory_get_conversation_messages(self.conversation_id, limit)
                
            cur = conn.cursor()
            
            # Get recent messages
            cur.execute(
                """
                SELECT role, content
                FROM messages
                WHERE conversation_id = %s
                ORDER BY created_at DESC
                LIMIT %s
                """,
                (self.conversation_id, limit)
            )
            
            # Convert to list of dicts
            messages = [
                {
                    "role": role,
                    "content": content
                }
                for role, content in cur.fetchall()
            ]
            
            # Reverse to get chronological order
            messages.reverse()
            
            return messages
            
        except Exception as e:
            logger.error(f"Error getting conversation context: {e}")
            # Fallback to memory storage
            return DatabaseConnection.memory_get_conversation_messages(self.conversation_id, limit)
        finally:
            if conn:
                DatabaseConnection.return_connection(conn)

    @property
    def messages(self):
        """Lazy load all messages only when needed"""
        if not self._is_fully_loaded:
            self.load_all_messages()
        return self._messages

    def clear_history(self):
        """Clear all chat history from database for the current conversation"""
        try:
            conn = DatabaseConnection.get_connection()
            cur = conn.cursor()
            
            if self.user_id:
                cur.execute("DELETE FROM chat_history WHERE user_id = %s AND conversation_id = %s", (self.user_id, self.conversation_id))
            else:
                cur.execute("DELETE FROM chat_history WHERE conversation_id = %s", (self.conversation_id,))
            
            conn.commit()
            self._recent_messages = []
            self._messages = []
            self._is_fully_loaded = True
            logger.info("Chat history cleared successfully")
            
        except Exception as e:
            logger.error(f"Error clearing chat history: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                DatabaseConnection.return_connection(conn)
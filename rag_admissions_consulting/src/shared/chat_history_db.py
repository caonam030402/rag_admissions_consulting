from loguru import logger
from .database import DatabaseConnection
from .enum import RoleType
import uuid
import json

class ChatHistoryManager:
    def __init__(self, user_id=None):
        self._messages = []
        self.user_id = user_id
        self.conversation_id = str(uuid.uuid4())
        self._cache_key = f"chat_history:{self.user_id}:{self.conversation_id}"
        self._recent_messages = []
        self._is_fully_loaded = False
        # Don't load messages on initialization to start fresh each time

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

    def append_message(self, role: RoleType, content: str):
        """Add a new message to the chat history with optimized memory-first approach"""
        # Create new message with minimal data
        new_message = {"role": role, "content": content, "conversation_id": self.conversation_id}
        
        # Update memory immediately using efficient list operations
        self._recent_messages.append(new_message)
        if len(self._recent_messages) > 10:
            self._recent_messages.pop(0)
            
        if self._is_fully_loaded:
            self.messages.append(new_message)
            
        # Update cache with increased TTL for active conversations
        DatabaseConnection.set_cache(self._cache_key, self._recent_messages, ttl=1800)  # 30 minutes TTL
        
        # Save to database using connection pooling
        try:
            conn = DatabaseConnection.get_connection()
            cur = conn.cursor()
            
            cur.execute(
                """
                INSERT INTO chat_history 
                    (user_id, conversation_id, role, content) 
                VALUES 
                    (%s, %s, %s, %s)
                """,
                (self.user_id, self.conversation_id, role, content)
            )
            
            conn.commit()
            logger.info(f"Message saved to database: {role}")
            
        except Exception as e:
            logger.error(f"Error saving message to database: {e}")
            if conn:
                conn.rollback()
        finally:
            if conn:
                DatabaseConnection.return_connection(conn)

    def get_conversation_context(self, max_messages=5):
        """Get the recent conversation context for the current conversation"""
        # Use recent messages for context
        conversation_messages = [msg for msg in self._recent_messages 
                               if msg["conversation_id"] == self.conversation_id]
        return conversation_messages[-max_messages:] if conversation_messages else []

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
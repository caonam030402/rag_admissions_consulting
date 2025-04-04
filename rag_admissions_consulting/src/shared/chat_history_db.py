from loguru import logger
from .database import DatabaseConnection
from .enum import RoleType
import uuid

class ChatHistoryManager:
    def __init__(self, user_id=None):
        self.messages = []
        self.user_id = user_id
        self.conversation_id = str(uuid.uuid4())
        self.load_messages()

    def append_message(self, role: RoleType, content: str):
        """Add a new message to the chat history and save to database"""
        try:
            conn = DatabaseConnection.get_connection()
            cur = conn.cursor()
            
            cur.execute(
                "INSERT INTO chat_history (user_id, conversation_id, role, content) VALUES (%s, %s, %s, %s)",
                (self.user_id, self.conversation_id, role, content)
            )
            
            conn.commit()
            self.messages.append({"role": role, "content": content, "conversation_id": self.conversation_id})
            logger.info(f"Message added to chat history: {role}")
            
        except Exception as e:
            logger.error(f"Error appending message to database: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                DatabaseConnection.return_connection(conn)

    def load_messages(self):
        """Load all messages for the user from database"""
        try:
            conn = DatabaseConnection.get_connection()
            cur = conn.cursor()
            
            if self.user_id:
                # Load all messages for the user
                query = "SELECT role, content, conversation_id FROM chat_history WHERE user_id = %s ORDER BY timestamp ASC"
                cur.execute(query, (self.user_id,))
            else:
                # If no user_id, only load current conversation
                query = "SELECT role, content, conversation_id FROM chat_history WHERE conversation_id = %s ORDER BY timestamp ASC"
                cur.execute(query, (self.conversation_id,))
            
            self.messages = []
            for role, content, conv_id in cur.fetchall():
                self.messages.append({"role": role, "content": content, "conversation_id": conv_id})
                
            logger.info(f"Loaded {len(self.messages)} messages from database")
            
        except Exception as e:
            logger.error(f"Error loading messages from database: {e}")
            raise
        finally:
            if conn:
                DatabaseConnection.return_connection(conn)

    def get_conversation_context(self, max_messages=5):
        """Get the recent conversation context for the current conversation"""
        # Filter messages for current conversation
        conversation_messages = [msg for msg in self.messages 
                               if msg["conversation_id"] == self.conversation_id]
        return conversation_messages[-max_messages:] if conversation_messages else []

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
            self.messages = []
            logger.info("Chat history cleared successfully")
            
        except Exception as e:
            logger.error(f"Error clearing chat history: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                DatabaseConnection.return_connection(conn)
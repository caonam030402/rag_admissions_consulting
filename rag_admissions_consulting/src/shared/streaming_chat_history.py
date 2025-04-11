from loguru import logger
from typing import AsyncGenerator, Dict, Any
from .database import DatabaseConnection
from .enum import RoleType
import uuid
import asyncio

class StreamingChatHistoryManager:
    def __init__(self, user_id=None):
        self.user_id = user_id
        self.conversation_id = str(uuid.uuid4())
        self._cache_key = f"chat_history:{self.user_id}:{self.conversation_id}"
        self._recent_messages = []

    async def stream_message(self, role: RoleType, content: str, chunk_size: int = 10) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream a message in chunks while saving to database asynchronously"""
        new_message = {"role": role, "content": "", "conversation_id": self.conversation_id}
        
        # Split content into chunks for streaming
        content_chunks = [content[i:i + chunk_size] for i in range(0, len(content), chunk_size)]
        
        # Start database save task in background
        save_task = asyncio.create_task(self._save_message_async(role, content))
        
        try:
            # Stream content chunks
            for chunk in content_chunks:
                new_message["content"] += chunk
                yield {"type": "chunk", "data": new_message.copy()}
                await asyncio.sleep(0.05)  # Small delay for natural streaming effect
            
            # Wait for save operation to complete
            await save_task
            
            # Update memory cache
            self._recent_messages.append(new_message)
            if len(self._recent_messages) > 10:
                self._recent_messages.pop(0)
                
            # Update cache with increased TTL
            await self._update_cache_async()
            
            # Send completion signal
            yield {"type": "complete", "data": new_message}
            
        except Exception as e:
            logger.error(f"Error streaming message: {e}")
            # Send error signal
            yield {"type": "error", "error": str(e)}
            raise

    async def _save_message_async(self, role: RoleType, content: str):
        """Save message to database asynchronously"""
        try:
            conn = DatabaseConnection.get_connection()
            cur = conn.cursor()
            
            await cur.execute(
                """
                INSERT INTO chat_history 
                    (user_id, conversation_id, role, content) 
                VALUES 
                    (%s, %s, %s, %s)
                """,
                (self.user_id, self.conversation_id, role, content)
            )
            
            await conn.commit()
            logger.info(f"Message saved to database: {role}")
            
        except Exception as e:
            logger.error(f"Error saving message to database: {e}")
            if conn:
                await conn.rollback()
            raise
        finally:
            if conn:
                DatabaseConnection.return_connection(conn)

    async def _update_cache_async(self):
        """Update cache with recent messages"""
        try:
            await DatabaseConnection.set_cache_async(
                self._cache_key,
                self._recent_messages,
                ttl=1800  # 30 minutes TTL
            )
        except Exception as e:
            logger.error(f"Error updating cache: {e}")

    async def get_conversation_context(self, max_messages=5):
        """Get recent conversation context asynchronously"""
        conversation_messages = [msg for msg in self._recent_messages 
                               if msg["conversation_id"] == self.conversation_id]
        return conversation_messages[-max_messages:] if conversation_messages else []
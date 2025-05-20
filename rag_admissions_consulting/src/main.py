from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, AsyncGenerator, Dict
from datetime import datetime
from rag_agent import RagAgent
from llms import LLms
from shared.enum import ModelType, RoleType
from store import store
from embeddings import embeddings
from shared.database import DatabaseConnection, setup_database, using_memory_mode
from shared.chat_history_db import ChatHistoryManager
from shared.context_manager import ConversationContextManager
from loguru import logger
import json
import asyncio
from functools import lru_cache
import sys
from ood_agent import OODAgent
from ood_config import OOD_SIMILARITY_THRESHOLD, ENABLE_OOD_DETECTION

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache for expensive operations
user_cache: Dict[str, int] = {}
context_cache: Dict[str, ConversationContextManager] = {}  # Cache by conversation_id
retriever_cache = None
llm_cache = None
ood_agent_cache = None


# Setup database on startup
@app.on_event("startup")
async def startup_event():
    try:
        # First, check database connection
        setup_database()

        # Pre-initialize LLM and retriever
        global llm_cache, retriever_cache, ood_agent_cache
        logger.info("Initializing LLM...")
        llm_cache = LLms.getLLm(ModelType.OPENAI)

        logger.info("Initializing embedding model...")
        embedding = embeddings.get_embeddings(ModelType.HUGGINGFACE)

        logger.info("Initializing retriever...")
        retriever_cache = store.getRetriever(embedding)

        logger.info("Initializing OOD agent...")
        ood_agent_cache = OODAgent(
            similarity_threshold=OOD_SIMILARITY_THRESHOLD, enabled=ENABLE_OOD_DETECTION
        )

        logger.info("Startup successful!")
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        # Continue running even with errors - we'll handle failures at runtime


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str
    conversation_id: str


class ChatRequest(BaseModel):
    message: str
    user_email: str
    conversation_id: Optional[str] = None


async def get_or_create_user(user_email: str):
    """Get user ID from email or create new user - async version"""
    # Check cache first
    if user_email in user_cache:
        return user_cache[user_email]

    # Check if we're in memory mode
    global using_memory_mode
    if using_memory_mode:
        user_id = DatabaseConnection.memory_get_or_create_user(user_email)
        user_cache[user_email] = user_id
        return user_id

    conn = None
    try:
        conn = DatabaseConnection.get_connection()
        if conn is None:  # We're in memory mode
            user_id = DatabaseConnection.memory_get_or_create_user(user_email)
            user_cache[user_email] = user_id
            return user_id

        cur = conn.cursor()

        # Check if user exists
        cur.execute("SELECT id FROM users WHERE email = %s", (user_email,))
        result = cur.fetchone()

        if result:
            user_id = result[0]
            user_cache[user_email] = user_id
            return user_id

        # Create new user
        cur.execute("INSERT INTO users (email) VALUES (%s) RETURNING id", (user_email,))
        user_id = cur.fetchone()[0]
        conn.commit()
        user_cache[user_email] = user_id
        return user_id

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error in get_or_create_user: {e}")
        # Use memory mode as fallback
        user_id = DatabaseConnection.memory_get_or_create_user(user_email)
        user_cache[user_email] = user_id
        return user_id
    finally:
        if conn:
            DatabaseConnection.return_connection(conn)


def get_context_manager(
    user_id: int, user_email: str, conversation_id: Optional[str] = None
) -> ConversationContextManager:
    """Get or create a context manager for the conversation"""
    # If we have a conversation ID and it's in the cache, return it
    if conversation_id and conversation_id in context_cache:
        logger.info(f"Using cached context manager for conversation {conversation_id}")
        return context_cache[conversation_id]

    # Create a new chat history manager
    chat_manager = ChatHistoryManager(user_id, email=user_email)

    # If we had a conversation ID but it wasn't in cache, use that ID
    if conversation_id:
        chat_manager.conversation_id = conversation_id
        logger.info(
            f"Created new context manager with provided conversation ID: {conversation_id}"
        )

    # Create a context manager
    context_manager = ConversationContextManager(chat_manager)

    # Cache it
    context_cache[chat_manager.conversation_id] = context_manager

    # Clean up the cache if it gets too large
    if len(context_cache) > 1000:
        # Remove oldest entries (simple approach)
        keys_to_remove = list(context_cache.keys())[:-100]  # Keep the 900 most recent
        for key in keys_to_remove:
            del context_cache[key]
        logger.info(f"Cleaned context cache, removed {len(keys_to_remove)} old entries")

    return context_manager


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(
        stream_chat_response(request), media_type="text/event-stream"
    )


async def stream_chat_response(request: ChatRequest) -> AsyncGenerator[str, None]:
    # Get or create user - now async
    user_id = await get_or_create_user(request.user_email)

    # Get or create context manager
    context_manager = get_context_manager(
        user_id, request.user_email, request.conversation_id
    )
    conversation_id = context_manager.history_manager.conversation_id
    logger.info(
        f"Xử lý yêu cầu chat từ user: {request.user_email}, conversation: {conversation_id}"
    )

    # Use cached components or initialize on demand if they failed during startup
    global llm_cache, retriever_cache, ood_agent_cache
    if not llm_cache:
        logger.info("LLM not initialized during startup, initializing now...")
        llm_cache = LLms.getLLm(ModelType.OPENAI)

    if not retriever_cache:
        logger.info("Retriever not initialized during startup, initializing now...")
        embedding = embeddings.get_embeddings(ModelType.HUGGINGFACE)
        retriever_cache = store.getRetriever(embedding)

    if not ood_agent_cache:
        logger.info("OOD agent not initialized during startup, initializing now...")
        ood_agent_cache = OODAgent(
            similarity_threshold=OOD_SIMILARITY_THRESHOLD, enabled=ENABLE_OOD_DETECTION
        )

    llm = llm_cache
    retriever = retriever_cache
    ood_agent = ood_agent_cache

    # Get conversation context
    context = context_manager.get_conversation_context()

    # Log context for debugging
    logger.info(f"Retrieved {len(context)} messages from conversation context")
    if context:
        for i, msg in enumerate(context[-3:]):  # Log the last 3 messages
            logger.info(
                f"Context message {i}: {msg['role']} - {msg['content'][:50]}..."
            )

    # Save user message asynchronously through the context manager
    asyncio.create_task(save_message(context_manager, RoleType.USER, request.message))

    try:
        full_response = ""
        async for token in RagAgent.answer_question_stream(
            question=request.message,
            llm=llm,
            retriever=retriever,
            chat_history=[(msg["role"], msg["content"]) for msg in context],
            ood_agent=ood_agent,
        ):
            full_response += token
            yield json.dumps(
                {"delta": token, "conversation_id": conversation_id}
            ) + "\n"

        # Save assistant's complete message asynchronously through context manager
        asyncio.create_task(
            save_message(context_manager, RoleType.ASSISTANT, full_response)
        )

    except Exception as e:
        logger.error(f"Error generating response: {e}")
        error_message = "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau."
        yield json.dumps(
            {"delta": error_message, "conversation_id": conversation_id}
        ) + "\n"
        # Still save the error message
        asyncio.create_task(
            save_message(context_manager, RoleType.ASSISTANT, error_message)
        )


async def save_message(
    context_manager: ConversationContextManager, role: RoleType, content: str
):
    """Asynchronously save message using context manager"""
    try:
        await asyncio.to_thread(context_manager.append_message, role, content)
    except Exception as e:
        logger.error(f"Error saving message: {e}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

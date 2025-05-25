from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import AsyncGenerator
import json
import asyncio
from loguru import logger

from services.chat_service import ChatService
from services.user_service import UserService
from core.session_manager import session_manager

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    user_email: str
    conversation_id: str = None  # Optional conversation ID để tiếp tục cuộc trò chuyện


@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Chat endpoint with streaming response"""
    return StreamingResponse(
        stream_chat_response(request), media_type="text/event-stream"
    )


async def stream_chat_response(request: ChatRequest) -> AsyncGenerator[str, None]:
    """Stream chat response token by token"""
    try:
        # Get or create user
        user_service = UserService()
        user_id = await user_service.get_or_create_user(request.user_email)

        # Get or create conversation_id using SessionManager
        conversation_id = session_manager.get_or_create_conversation_id(
            request.user_email, request.conversation_id
        )

        # Initialize chat service with managed conversation_id
        chat_service = ChatService(user_id, request.user_email, conversation_id)

        logger.info(f"Processing chat request from user: {request.user_email}")

        # Generate streaming response
        full_response = ""

        async for token_data in chat_service.process_message_stream(request.message):
            if "delta" in token_data:
                full_response += token_data["delta"]
                # Add conversation_id to each token
                token_data["conversation_id"] = conversation_id
                yield json.dumps(token_data) + "\n"

        logger.info(f"Chat response completed for conversation: {conversation_id}")

    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        error_response = {
            "delta": "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
            "conversation_id": "error",
        }
        yield json.dumps(error_response) + "\n"

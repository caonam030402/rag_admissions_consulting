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
from config.settings import settings, initialize_settings_with_backend

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    user_email: str
    conversation_id: str = None  # Optional conversation ID để tiếp tục cuộc trò chuyện
    user_id: int = None  # Optional user_id for registered users


@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Chat endpoint with streaming response"""
    return StreamingResponse(
        stream_chat_response(request), media_type="text/event-stream"
    )


async def stream_chat_response(request: ChatRequest) -> AsyncGenerator[str, None]:
    """Stream chat response token by token"""
    try:
        # Determine user type and get user_id
        if request.user_id:
            # Registered user - use provided user_id
            user_id = request.user_id
            logger.info(f"Processing chat request from registered user ID: {user_id}")
        else:
            # Guest user - do NOT create user_id, use email-based identification
            user_id = None  # No user_id for guests
            logger.info(
                f"Processing chat request from guest user: {request.user_email}"
            )

        # Get or create conversation_id using SessionManager
        conversation_id = session_manager.get_or_create_conversation_id(
            request.user_email, request.conversation_id
        )

        # Initialize chat service with proper user identification
        # For guests: user_id will be None, but user_email contains guest info
        chat_service = ChatService(
            user_id or 0,  # Use 0 as placeholder for guests (ChatService expects int)
            request.user_email,
            conversation_id,
        )

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


@router.post("/reload-config")
async def reload_config_endpoint():
    """Reload configuration from backend API without restarting the application"""
    try:
        logger.info("🔄 Reloading configuration from backend...")

        # Store previous config status for comparison
        previous_status = settings.is_backend_config_loaded()
        previous_personality = settings.personality.personality
        previous_name = settings.personality.name

        # Reload configuration from backend
        await initialize_settings_with_backend()

        # Check if config was successfully loaded
        new_status = settings.is_backend_config_loaded()
        new_personality = settings.personality.personality
        new_name = settings.personality.name

        # Prepare response with config changes
        config_changes = {
            "config_loaded": new_status,
            "previous_config_loaded": previous_status,
            "changes": {
                "personality": {
                    "previous": previous_personality,
                    "current": new_personality,
                    "changed": previous_personality != new_personality,
                },
                "name": {
                    "previous": previous_name,
                    "current": new_name,
                    "changed": previous_name != new_name,
                },
            },
        }

        if new_status:
            logger.info("✅ Configuration reloaded successfully from backend")
            return {
                "success": True,
                "message": "Configuration reloaded successfully from backend",
                "config_status": "loaded_from_backend",
                "timestamp": asyncio.get_event_loop().time(),
                "config_changes": config_changes,
                "current_config": {
                    "personality": {
                        "name": settings.personality.name,
                        "personality": settings.personality.personality,
                        "creativity_level": settings.personality.creativity_level,
                        "persona": (
                            settings.personality.persona[:100] + "..."
                            if len(settings.personality.persona) > 100
                            else settings.personality.persona
                        ),
                    },
                    "contact_info": settings.contact_info,
                    "environment": settings.environment,
                    "debug": settings.debug,
                },
            }
        else:
            logger.warning("⚠️ Configuration reload failed, using default settings")
            return {
                "success": False,
                "message": "Failed to reload from backend, using default configuration",
                "config_status": "using_defaults",
                "timestamp": asyncio.get_event_loop().time(),
                "config_changes": config_changes,
                "current_config": {
                    "personality": {
                        "name": settings.personality.name,
                        "personality": settings.personality.personality,
                        "creativity_level": settings.personality.creativity_level,
                        "persona": (
                            settings.personality.persona[:100] + "..."
                            if len(settings.personality.persona) > 100
                            else settings.personality.persona
                        ),
                    },
                    "contact_info": settings.contact_info,
                    "environment": settings.environment,
                    "debug": settings.debug,
                },
            }

    except Exception as e:
        logger.error(f"❌ Error reloading configuration: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": f"Internal server error while reloading configuration: {str(e)}",
                "config_status": "error",
                "timestamp": asyncio.get_event_loop().time(),
            },
        )


@router.get("/config-status")
async def get_config_status():
    """Get current configuration status and settings"""
    try:
        return {
            "config_loaded_from_backend": settings.is_backend_config_loaded(),
            "environment": settings.environment,
            "debug": settings.debug,
            "personality": {
                "name": settings.personality.name,
                "personality": settings.personality.personality,
                "creativity_level": settings.personality.creativity_level,
                "persona_preview": (
                    settings.personality.persona[:100] + "..."
                    if len(settings.personality.persona) > 100
                    else settings.personality.persona
                ),
            },
            "llm_config": {
                "default_model": settings.llm.default_model,
                "max_tokens": settings.llm.max_tokens,
                "temperature": settings.llm.temperature,
            },
            "chat_config": {
                "max_context_length": settings.chat.max_context_length,
                "context_window_minutes": settings.chat.context_window_minutes,
                "max_response_tokens": settings.chat.max_response_tokens,
                "stream_delay_ms": settings.chat.stream_delay_ms,
            },
            "contact_info": settings.contact_info,
            "timestamp": asyncio.get_event_loop().time(),
        }

    except Exception as e:
        logger.error(f"❌ Error getting config status: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": f"Failed to get config status: {str(e)}",
                "timestamp": asyncio.get_event_loop().time(),
            },
        )

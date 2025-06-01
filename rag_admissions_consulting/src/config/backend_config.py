"""
Config loader from backend API
Handles fetching configuration from NestJS backend and applying to RAG system
"""

import httpx
import os
from typing import Dict, Any, Optional
from dataclasses import dataclass
from loguru import logger

# Import constants
from shared.constant import API_ENDPOINTS


@dataclass
class BackendConfigResponse:
    """Response model từ backend API"""

    llm_config: Dict[str, Any]
    chat_config: Dict[str, Any]
    personality: Dict[str, Any]
    contact_info: Dict[str, Any]
    environment: str
    debug: bool


class BackendConfigLoader:
    """Service để lấy config từ backend API"""

    def __init__(self, backend_url: Optional[str] = None):
        self.backend_url = backend_url or os.getenv(
            "BACKEND_URL", "http://localhost:5000/api/v1"
        )
        self.config_endpoint = API_ENDPOINTS["rag_config"]
        self.timeout = 10.0

    async def fetch_config(self) -> Optional[BackendConfigResponse]:
        """
        Lấy config từ backend API

        Returns:
            BackendConfigResponse hoặc None nếu có lỗi
        """
        try:
            url = f"{self.backend_url}{self.config_endpoint}"
            logger.info(f"Fetching config from backend: {url}")

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                response.raise_for_status()

                data = response.json()
                logger.success("Successfully fetched config from backend")

                return BackendConfigResponse(
                    llm_config=data["llmConfig"],
                    chat_config=data["chatConfig"],
                    personality=data["personality"],
                    contact_info=data["contactInfo"],
                    environment=data["environment"],
                    debug=data["debug"],
                )

        except httpx.TimeoutException:
            logger.error(f"Timeout when fetching config from {url}")
            return None

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error when fetching config: {e.response.status_code}")
            return None

        except Exception as e:
            logger.error(f"Unexpected error when fetching config: {str(e)}")
            return None

    def fetch_config_sync(self) -> Optional[BackendConfigResponse]:
        """
        Lấy config từ backend API (sync version)

        Returns:
            BackendConfigResponse hoặc None nếu có lỗi
        """
        try:
            url = f"{self.backend_url}{self.config_endpoint}"
            logger.info(f"Fetching config from backend: {url}")

            with httpx.Client(timeout=self.timeout) as client:
                response = client.get(url)
                response.raise_for_status()

                data = response.json()
                logger.success("Successfully fetched config from backend")

                return BackendConfigResponse(
                    llm_config=data["llmConfig"],
                    chat_config=data["chatConfig"],
                    personality=data["personality"],
                    contact_info=data["contactInfo"],
                    environment=data["environment"],
                    debug=data["debug"],
                )

        except httpx.TimeoutException:
            logger.error(f"Timeout when fetching config from {url}")
            return None

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error when fetching config: {e.response.status_code}")
            return None

        except Exception as e:
            logger.error(f"Unexpected error when fetching config: {str(e)}")
            return None


def apply_backend_config_to_settings(
    backend_config: BackendConfigResponse, settings_obj: Any
) -> None:
    """
    Apply config từ backend vào settings object
    Chỉ update những field có giá trị từ backend, còn lại giữ nguyên

    Args:
        backend_config: Config từ backend
        settings_obj: Settings object cần update
    """
    try:
        # Import mapping constants
        from shared.constant import MODEL_MAPPING

        # Update LLM config - chỉ update khi có giá trị
        if backend_config.llm_config.get("defaultModel"):
            # Map backend enum values to actual model names
            backend_model = backend_config.llm_config["defaultModel"]

            mapped_model = MODEL_MAPPING.get(backend_model, backend_model)
            settings_obj.llm.default_model = mapped_model
            logger.info(f"🤖 Updated LLM model: {backend_model} -> {mapped_model}")

        if backend_config.llm_config.get("maxTokens") is not None:
            settings_obj.llm.max_tokens = backend_config.llm_config["maxTokens"]

        if backend_config.llm_config.get("temperature") is not None:
            settings_obj.llm.temperature = backend_config.llm_config["temperature"]

        # Update Chat config - chỉ update khi có giá trị
        if backend_config.chat_config.get("maxContextLength") is not None:
            settings_obj.chat.max_context_length = backend_config.chat_config[
                "maxContextLength"
            ]

        if backend_config.chat_config.get("contextWindowMinutes") is not None:
            settings_obj.chat.context_window_minutes = backend_config.chat_config[
                "contextWindowMinutes"
            ]

        if backend_config.chat_config.get("maxResponseTokens") is not None:
            settings_obj.chat.max_response_tokens = backend_config.chat_config[
                "maxResponseTokens"
            ]

        if backend_config.chat_config.get("streamDelayMs") is not None:
            settings_obj.chat.stream_delay_ms = backend_config.chat_config[
                "streamDelayMs"
            ]

        # Update Environment và Debug - chỉ update khi có giá trị
        if backend_config.environment:
            settings_obj.environment = backend_config.environment

        if backend_config.debug is not None:
            settings_obj.debug = backend_config.debug

        # Update Personality config - merge với existing config
        if backend_config.personality:
            if not hasattr(settings_obj, "personality") or not isinstance(
                settings_obj.personality, dict
            ):
                settings_obj.personality = {}

            # Update personality fields if they have values
            for key in ["name", "persona", "personality", "creativityLevel"]:
                if (
                    key in backend_config.personality
                    and backend_config.personality[key]
                ):
                    settings_obj.personality[key] = backend_config.personality[key]

        # Update Contact info - merge với existing config
        if backend_config.contact_info:
            if not hasattr(settings_obj, "contact_info") or not isinstance(
                settings_obj.contact_info, dict
            ):
                settings_obj.contact_info = {}

            # Update contact fields if they have values
            for key in ["hotline", "email", "website", "address"]:
                if (
                    key in backend_config.contact_info
                    and backend_config.contact_info[key]
                ):
                    settings_obj.contact_info[key] = backend_config.contact_info[key]

        logger.info("✅ Successfully applied backend config to settings")

    except Exception as e:
        logger.error(f"❌ Error applying backend config: {str(e)}")
        raise


async def load_config_from_backend(settings_obj: Any) -> bool:
    """
    Load và apply config từ backend

    Args:
        settings_obj: Settings object cần update

    Returns:
        True nếu thành công, False nếu có lỗi
    """
    loader = BackendConfigLoader()
    config = await loader.fetch_config()

    if config is None:
        logger.warning("Failed to load config from backend, using local config")
        return False

    apply_backend_config_to_settings(config, settings_obj)
    return True


def load_config_from_backend_sync(settings_obj: Any) -> bool:
    """
    Load và apply config từ backend (sync version)

    Args:
        settings_obj: Settings object cần update

    Returns:
        True nếu thành công, False nếu có lỗi
    """
    loader = BackendConfigLoader()
    config = loader.fetch_config_sync()

    if config is None:
        logger.warning("Failed to load config from backend, using local config")
        return False

    apply_backend_config_to_settings(config, settings_obj)
    return True

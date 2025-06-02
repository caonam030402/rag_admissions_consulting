import os
import httpx
from typing import Dict, Any, Optional
from loguru import logger
import asyncio
from dataclasses import dataclass


@dataclass
class PersonalityConfig:
    """Personality configuration from backend"""

    name: str = "AI Tư vấn viên ĐH Đông Á"
    persona: str = (
        "Bạn là một chuyên viên tư vấn tuyển sinh thông minh, chuyên nghiệp và thân thiện của ĐH Đông Á."
    )
    personality: str = "Professional"
    creativity_level: float = 0.1


class ConfigClient:
    """Client to fetch configuration from backend API"""

    def __init__(self):
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
        self.config_endpoint = f"{self.backend_url}/chatbot-config/rag/config"
        self._config_cache: Optional[Dict[str, Any]] = None

    async def fetch_config(self) -> Dict[str, Any]:
        """Fetch configuration from backend API"""
        try:
            logger.info(f"🔄 Fetching config from backend: {self.config_endpoint}")

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.config_endpoint)

                if response.status_code == 200:
                    config_data = response.json()
                    self._config_cache = config_data
                    logger.info("✅ Successfully fetched config from backend")
                    return config_data
                else:
                    logger.warning(
                        f"⚠️ Backend returned status {response.status_code}, using default config"
                    )
                    return self._get_default_config()

        except Exception as e:
            logger.warning(
                f"⚠️ Failed to fetch config from backend: {e}, using default config"
            )
            return self._get_default_config()

    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration as fallback"""
        return {
            "llmConfig": {
                "defaultModel": "GEMINI",
                "maxTokens": 2048,
                "temperature": 0.7,
            },
            "chatConfig": {
                "maxContextLength": 20,
                "contextWindowMinutes": 30,
                "maxResponseTokens": 1024,
                "streamDelayMs": 50,
            },
            "personality": {
                "name": "AI Tư vấn viên ĐH Đông Á",
                "persona": "Bạn là một chuyên viên tư vấn tuyển sinh thông minh, chuyên nghiệp và thân thiện của ĐH Đông Á. Bạn có khả năng hiểu ngữ cảnh cuộc trò chuyển và đưa ra những câu trả lời chính xác, hữu ích về tuyển sinh, ngành học, học phí, học bổng và mọi thông tin liên quan đến trường.",
                "personality": "Professional",
                "creativityLevel": 0.1,
            },
            "contactInfo": {
                "hotline": "0236.3.650.403",
                "email": "tuyensinh@donga.edu.vn",
                "website": "https://donga.edu.vn",
                "address": "33 Xô Viết Nghệ Tĩnh, Hải Châu, Đà Nẵng",
            },
            "environment": "development",
            "debug": False,
        }

    def get_cached_config(self) -> Optional[Dict[str, Any]]:
        """Get cached configuration"""
        return self._config_cache


# Global config client instance
config_client = ConfigClient()


async def load_backend_config() -> Dict[str, Any]:
    """Load configuration from backend API - called once at startup"""
    return await config_client.fetch_config()


def get_personality_config() -> PersonalityConfig:
    """Get personality configuration"""
    cached_config = config_client.get_cached_config()

    if cached_config and "personality" in cached_config:
        personality_data = cached_config["personality"]
        return PersonalityConfig(
            name=personality_data.get("name", "AI Tư vấn viên ĐH Đông Á"),
            persona=personality_data.get(
                "persona",
                "Bạn là một chuyên viên tư vấn tuyển sinh thông minh, chuyên nghiệp và thân thiện của ĐH Đông Á.",
            ),
            personality=personality_data.get("personality", "Professional"),
            creativity_level=personality_data.get("creativityLevel", 0.1),
        )

    # Return default if no cached config
    return PersonalityConfig()

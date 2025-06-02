from typing import List, Dict, Any, Optional
import os
from dataclasses import dataclass, field
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


@dataclass
class DatabaseConfig:
    """Database configuration"""

    host: str = os.getenv("DB_HOST", "localhost")
    port: int = int(os.getenv("DB_PORT", "5432"))
    name: str = os.getenv("DB_NAME", "admissions_db")
    user: str = os.getenv("DB_USER", "postgres")
    password: str = os.getenv("DB_PASSWORD", "")
    pool_size: int = int(os.getenv("DB_POOL_SIZE", "10"))


@dataclass
class LLMConfig:
    """LLM configuration"""

    default_model: str = os.getenv("DEFAULT_LLM_MODEL", "GEMINI")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    max_tokens: int = int(os.getenv("LLM_MAX_TOKENS", "2048"))
    temperature: float = float(os.getenv("LLM_TEMPERATURE", "0.7"))


@dataclass
class EmbeddingConfig:
    """Embedding model configuration"""

    default_model: str = os.getenv("DEFAULT_EMBEDDING_MODEL", "HUGGINGFACE")
    model_name: str = os.getenv("EMBEDDING_MODEL_NAME", "intfloat/multilingual-e5-base")
    cache_dir: str = os.getenv("EMBEDDING_CACHE_DIR", "./models/embeddings")


@dataclass
class VectorStoreConfig:
    """Vector store configuration"""

    pinecone_api_key: str = os.getenv("PINECONE_API_KEY", "")
    pinecone_environment: str = os.getenv("PINECONE_ENVIRONMENT", "")
    index_name: str = os.getenv("PINECONE_INDEX_NAME", "test11")
    top_k: int = int(os.getenv("VECTOR_STORE_TOP_K", "5"))


@dataclass
class ChatConfig:
    """Chat configuration"""

    max_context_length: int = int(os.getenv("MAX_CONTEXT_LENGTH", "20"))
    context_window_minutes: int = int(os.getenv("CONTEXT_WINDOW_MINUTES", "30"))
    max_response_tokens: int = int(os.getenv("MAX_RESPONSE_TOKENS", "1024"))
    stream_delay_ms: int = int(os.getenv("STREAM_DELAY_MS", "50"))


@dataclass
class PersonalityConfig:
    """Personality configuration - can be overridden by backend"""

    name: str = "AI Tư vấn viên ĐH Đông Á"
    persona: str = (
        "Bạn là một chuyên viên tư vấn tuyển sinh thông minh, chuyên nghiệp và thân thiện của ĐH Đông Á."
    )
    personality: str = (
        "Professional"  # Professional, Sassy, Empathetic, Formal, Humorous, Friendly
    )
    creativity_level: float = 0.1


@dataclass
class APIConfig:
    """API configuration"""

    host: str = os.getenv("API_HOST", "0.0.0.0")
    port: int = int(os.getenv("API_PORT", "8000"))
    api_prefix: str = os.getenv("API_PREFIX", "/api/v1")
    cors_origins: List[str] = field(
        default_factory=lambda: os.getenv(
            "CORS_ORIGINS", "http://localhost:3000"
        ).split(",")
    )


@dataclass
class LoggingConfig:
    """Logging configuration"""

    level: str = os.getenv("LOG_LEVEL", "INFO")
    format: str = os.getenv("LOG_FORMAT", "{time} | {level} | {message}")
    file_path: str = os.getenv("LOG_FILE_PATH", "")
    max_file_size: str = os.getenv("LOG_MAX_FILE_SIZE", "10 MB")


class Settings:
    """Application settings"""

    def __init__(self):
        self.database = DatabaseConfig()
        self.llm = LLMConfig()
        self.embedding = EmbeddingConfig()
        self.vector_store = VectorStoreConfig()
        self.chat = ChatConfig()
        self.personality = PersonalityConfig()
        self.api = APIConfig()
        self.logging = LoggingConfig()

        # Environment
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.debug = os.getenv("DEBUG", "false").lower() == "true"

        # Contact information
        self.contact_info = {
            "hotline": "0236.3.650.403",
            "email": "tuyensinh@donga.edu.vn",
            "website": "https://donga.edu.vn",
            "address": "33 Xô Viết Nghệ Tĩnh, Hải Châu, Đà Nẵng",
        }

        # Backend config integration flag
        self._backend_config_loaded = False

    def is_production(self) -> bool:
        """Check if running in production"""
        return self.environment.lower() == "production"

    def is_development(self) -> bool:
        """Check if running in development"""
        return self.environment.lower() == "development"

    def update_from_backend_config(self, backend_config: Dict[str, Any]):
        """Update settings with configuration from backend API"""
        try:
            # Update LLM config if available
            if "llmConfig" in backend_config:
                llm_config = backend_config["llmConfig"]
                self.llm.default_model = llm_config.get(
                    "defaultModel", self.llm.default_model
                )
                self.llm.max_tokens = llm_config.get("maxTokens", self.llm.max_tokens)
                self.llm.temperature = llm_config.get(
                    "temperature", self.llm.temperature
                )

            # Update Chat config if available
            if "chatConfig" in backend_config:
                chat_config = backend_config["chatConfig"]
                self.chat.max_context_length = chat_config.get(
                    "maxContextLength", self.chat.max_context_length
                )
                self.chat.context_window_minutes = chat_config.get(
                    "contextWindowMinutes", self.chat.context_window_minutes
                )
                self.chat.max_response_tokens = chat_config.get(
                    "maxResponseTokens", self.chat.max_response_tokens
                )
                self.chat.stream_delay_ms = chat_config.get(
                    "streamDelayMs", self.chat.stream_delay_ms
                )

            # Update Personality config if available
            if "personality" in backend_config:
                personality_config = backend_config["personality"]
                self.personality.name = personality_config.get(
                    "name", self.personality.name
                )
                self.personality.persona = personality_config.get(
                    "persona", self.personality.persona
                )
                self.personality.personality = personality_config.get(
                    "personality", self.personality.personality
                )
                self.personality.creativity_level = personality_config.get(
                    "creativityLevel", self.personality.creativity_level
                )

            # Update Contact info if available
            if "contactInfo" in backend_config:
                contact_config = backend_config["contactInfo"]
                self.contact_info.update(
                    {
                        "hotline": contact_config.get(
                            "hotline", self.contact_info["hotline"]
                        ),
                        "email": contact_config.get(
                            "email", self.contact_info["email"]
                        ),
                        "website": contact_config.get(
                            "website", self.contact_info["website"]
                        ),
                        "address": contact_config.get(
                            "address", self.contact_info["address"]
                        ),
                    }
                )

            # Update environment settings if available
            if "environment" in backend_config:
                self.environment = backend_config.get("environment", self.environment)

            if "debug" in backend_config:
                self.debug = backend_config.get("debug", self.debug)

            self._backend_config_loaded = True

        except Exception as e:
            from loguru import logger

            logger.warning(f"⚠️ Error updating settings from backend config: {e}")

    def is_backend_config_loaded(self) -> bool:
        """Check if backend configuration has been loaded"""
        return self._backend_config_loaded


# Global settings instance
settings = Settings()


async def initialize_settings_with_backend():
    """Initialize settings with backend configuration - called once at startup"""
    try:
        from utils.config_client import load_backend_config
        from loguru import logger

        logger.info("🔧 Loading configuration from backend...")
        backend_config = await load_backend_config()
        settings.update_from_backend_config(backend_config)
        logger.info("✅ Settings updated with backend configuration")

    except Exception as e:
        from loguru import logger

        logger.warning(f"⚠️ Failed to load backend config: {e}, using default settings")

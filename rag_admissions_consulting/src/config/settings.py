from typing import List, Dict, Any
import os
from dataclasses import dataclass, field
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import constants
from shared.constant import (
    DEFAULT_LLM_MODEL,
    DEFAULT_LLM_TEMPERATURE,
    DEFAULT_LLM_MAX_TOKENS,
    DEFAULT_MAX_CONTEXT_LENGTH,
    DEFAULT_CONTEXT_WINDOW_MINUTES,
    DEFAULT_MAX_RESPONSE_TOKENS,
    DEFAULT_STREAM_DELAY_MS,
    DEFAULT_CONTACT_INFO,
    DEFAULT_PERSONALITY,
    PERSONALITY_STYLES,
)


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

    default_model: str = os.getenv("DEFAULT_LLM_MODEL", DEFAULT_LLM_MODEL)
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    max_tokens: int = int(os.getenv("LLM_MAX_TOKENS", str(DEFAULT_LLM_MAX_TOKENS)))
    temperature: float = float(
        os.getenv("LLM_TEMPERATURE", str(DEFAULT_LLM_TEMPERATURE))
    )


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

    max_context_length: int = int(
        os.getenv("MAX_CONTEXT_LENGTH", str(DEFAULT_MAX_CONTEXT_LENGTH))
    )
    context_window_minutes: int = int(
        os.getenv("CONTEXT_WINDOW_MINUTES", str(DEFAULT_CONTEXT_WINDOW_MINUTES))
    )
    max_response_tokens: int = int(
        os.getenv("MAX_RESPONSE_TOKENS", str(DEFAULT_MAX_RESPONSE_TOKENS))
    )
    stream_delay_ms: int = int(
        os.getenv("STREAM_DELAY_MS", str(DEFAULT_STREAM_DELAY_MS))
    )


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
        self.api = APIConfig()
        self.logging = LoggingConfig()

        # Environment
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.debug = os.getenv("DEBUG", "false").lower() == "true"

        # Contact information (use constants)
        self.contact_info = DEFAULT_CONTACT_INFO.copy()

        # Personality config (use constants)
        self.personality = DEFAULT_PERSONALITY.copy()

        # Backend config options
        self.use_backend_config = (
            os.getenv("USE_BACKEND_CONFIG", "true").lower() == "true"
        )
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:3001")

    def is_production(self) -> bool:
        """Check if running in production"""
        return self.environment.lower() == "production"

    def is_development(self) -> bool:
        """Check if running in development"""
        return self.environment.lower() == "development"

    async def load_config_from_backend(self) -> bool:
        """
        Load config từ backend nếu enabled

        Returns:
            True nếu thành công hoặc không enabled, False nếu có lỗi
        """
        if not self.use_backend_config:
            return True

        try:
            from .backend_config import load_config_from_backend

            return await load_config_from_backend(self)
        except ImportError:
            # Nếu không có httpx hoặc dependencies khác
            return True
        except Exception as e:
            from loguru import logger

            logger.error(f"Failed to load config from backend: {str(e)}")
            return False

    def load_config_from_backend_sync(self) -> bool:
        """
        Load config từ backend (sync version)

        Returns:
            True nếu thành công hoặc không enabled, False nếu có lỗi
        """
        if not self.use_backend_config:
            return True

        try:
            from .backend_config import load_config_from_backend_sync

            return load_config_from_backend_sync(self)
        except ImportError:
            # Nếu không có httpx hoặc dependencies khác
            return True
        except Exception as e:
            from loguru import logger

            logger.error(f"Failed to load config from backend: {str(e)}")
            return False

    def get_persona_for_prompt(self) -> str:
        """Get the main persona text for system prompt"""
        if hasattr(self, "personality") and isinstance(self.personality, dict):
            return self.personality.get("persona", "")
        return ""

    def get_assistant_name(self) -> str:
        """Get assistant name from personality config"""
        if hasattr(self, "personality") and isinstance(self.personality, dict):
            return self.personality.get("name", "một chuyên viên tư vấn tuyển sinh")
        return "một chuyên viên tư vấn tuyển sinh"

    def get_personality_style(self) -> str:
        """Get personality style for customizing responses"""
        if hasattr(self, "personality") and isinstance(self.personality, dict):
            personality_type = self.personality.get("personality", "professional")
            return PERSONALITY_STYLES.get(
                personality_type, "chuyên nghiệp và thân thiện"
            )
        return "chuyên nghiệp và thân thiện"

    def get_creativity_level(self) -> float:
        """Get creativity level from personality config"""
        if hasattr(self, "personality") and isinstance(self.personality, dict):
            return self.personality.get("creativityLevel", 0.2)
        return 0.2


# Global settings instance
settings = Settings()

from typing import List, Dict, Any
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

        # Contact information
        self.contact_info = {
            "hotline": "0236.3.650.403",
            "email": "tuyensinh@donga.edu.vn",
            "website": "https://donga.edu.vn",
            "address": "33 Xô Viết Nghệ Tĩnh, Hải Châu, Đà Nẵng",
        }

    def is_production(self) -> bool:
        """Check if running in production"""
        return self.environment.lower() == "production"

    def is_development(self) -> bool:
        """Check if running in development"""
        return self.environment.lower() == "development"


# Global settings instance
settings = Settings()

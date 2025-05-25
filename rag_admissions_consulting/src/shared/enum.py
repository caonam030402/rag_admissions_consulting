from enum import Enum


class ModelType(str):
    GEMINI = "gemini"
    OPENAI = "openai"
    HUGGINGFACE = "huggingface"
    OLLAMA = "ollama"


class FileDataType(str):
    CSV = "csv"
    PDF = "pdf"
    JSON = "json"


class RoleType(str, Enum):
    """Enum for chat message roles"""

    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

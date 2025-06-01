from shared.enum import ModelType

# ===========================================
# MODEL CONSTANTS
# ===========================================

# Default model constants
OPENAI_MODEL = "gpt-4o-mini"
GEMINI_MODEL = "gemini-1.5-flash"
OLLAMA_MODEL = "deepseek-r1"

# Backend model names to actual model names mapping
MODEL_MAPPING = {
    "gemini-pro": "gemini-1.5-pro-latest",
    "gemini-flash": "gemini-1.5-flash",
    "gpt-4": "gpt-4o-mini",
    "gpt-3.5-turbo": "gpt-3.5-turbo",
    "ollama": "deepseek-r1",
}

# Backend model names to ModelType enum mapping
MODEL_TYPE_MAPPING = {
    "gemini-pro": ModelType.GEMINI,
    "gemini-flash": ModelType.GEMINI,
    "gpt-4": ModelType.OPENAI,
    "gpt-3.5-turbo": ModelType.OPENAI,
    "ollama": ModelType.OLLAMA,
    # Legacy mappings
    "OPENAI": ModelType.OPENAI,
    "GEMINI": ModelType.GEMINI,
    "OLLAMA": ModelType.OLLAMA,
}

# ===========================================
# PERSONALITY CONSTANTS
# ===========================================

# Personality styles mapping
PERSONALITY_STYLES = {
    "professional": "chuyên nghiệp, trang trọng và có chuyên môn cao",
    "sassy": "năng động, thú vị và có phần táo bạo",
    "empathetic": "thấu hiểu, ấm áp và quan tâm đến cảm xúc",
    "formal": "trang trọng, lịch sự và tuân thủ nghi thức",
    "humorous": "hài hước, vui vẻ và tạo không khí thoải mái",
    "friendly": "thân thiện, gần gũi và dễ tiếp cận",
}

# ===========================================
# API CONSTANTS
# ===========================================

# Backend API endpoints
API_ENDPOINTS = {
    "rag_config": "/chatbot-config/rag/config",
    "basic_info": "/chatbot-config/public/basic-info",
}

# ===========================================
# DEFAULT VALUES
# ===========================================

# LLM defaults
DEFAULT_LLM_TEMPERATURE = 0.7
DEFAULT_LLM_MAX_TOKENS = 2048
DEFAULT_LLM_MODEL = "GEMINI"

# Chat defaults
DEFAULT_MAX_CONTEXT_LENGTH = 20
DEFAULT_CONTEXT_WINDOW_MINUTES = 30
DEFAULT_MAX_RESPONSE_TOKENS = 1024
DEFAULT_STREAM_DELAY_MS = 50

# Contact info defaults
DEFAULT_CONTACT_INFO = {
    "hotline": "0236.3.650.403",
    "email": "tuyensinh@donga.edu.vn",
    "website": "https://donga.edu.vn",
    "address": "33 Xô Viết Nghệ Tĩnh, Hải Châu, Đà Nẵng",
}

# Personality defaults
DEFAULT_PERSONALITY = {
    "name": "Assistant",
    "persona": "",
    "personality_type": "professional",
    "creativity_level": 0.2,
}

# ===========================================
# HELPER FUNCTIONS
# ===========================================


def get_actual_model_name(backend_model_key: str, model_type: ModelType) -> str:
    """
    Get actual model name based on backend model key and type

    Args:
        backend_model_key: Model key from backend (e.g. "gemini-pro", "gpt-4")
        model_type: ModelType enum

    Returns:
        Actual model name for LangChain
    """
    if backend_model_key in MODEL_MAPPING:
        return MODEL_MAPPING[backend_model_key]

    # Fallback to defaults
    if model_type == ModelType.OPENAI:
        return OPENAI_MODEL
    elif model_type == ModelType.GEMINI:
        return GEMINI_MODEL
    elif model_type == ModelType.OLLAMA:
        return OLLAMA_MODEL
    else:
        return GEMINI_MODEL  # Default fallback


def get_model_type(backend_model_key: str) -> ModelType:
    """
    Get ModelType enum from backend model key

    Args:
        backend_model_key: Model key from backend

    Returns:
        ModelType enum
    """
    return MODEL_TYPE_MAPPING.get(backend_model_key, ModelType.GEMINI)


def get_personality_style(personality_type: str) -> str:
    """
    Get personality style description

    Args:
        personality_type: Personality type key

    Returns:
        Style description in Vietnamese
    """
    return PERSONALITY_STYLES.get(personality_type, "chuyên nghiệp và thân thiện")


# Legacy exports for backward compatibility
openai_model = OPENAI_MODEL
gemini_model = GEMINI_MODEL
type_embedding = ModelType.OLLAMA

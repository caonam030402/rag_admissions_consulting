from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama.llms import OllamaLLM
from shared.enum import ModelType
from shared.constant import (
    OPENAI_MODEL,
    GEMINI_MODEL,
    OLLAMA_MODEL,
    DEFAULT_LLM_TEMPERATURE,
    DEFAULT_LLM_MAX_TOKENS,
    get_actual_model_name,
)
from config.settings import settings


class LLms:
    @staticmethod
    def getLLm(
        type_model: ModelType, temperature=None, max_tokens=None, backend_model_key=None
    ):
        """
        Get LLM instance based on model type

        Args:
            type_model: ModelType enum value
            temperature: Optional temperature override
            max_tokens: Optional max_tokens override
            backend_model_key: Optional backend model key (e.g. "gemini-pro", "gpt-4")
        """
        # Use provided values or fall back to settings or defaults
        temp = (
            temperature
            if temperature is not None
            else getattr(settings.llm, "temperature", DEFAULT_LLM_TEMPERATURE)
        )
        tokens = (
            max_tokens
            if max_tokens is not None
            else getattr(settings.llm, "max_tokens", DEFAULT_LLM_MAX_TOKENS)
        )

        # Get actual model name from backend key or use defaults
        if backend_model_key:
            actual_model = get_actual_model_name(backend_model_key, type_model)
        else:
            # Use default model names
            if type_model == ModelType.OPENAI:
                actual_model = OPENAI_MODEL
            elif type_model == ModelType.GEMINI:
                actual_model = GEMINI_MODEL
            elif type_model == ModelType.OLLAMA:
                actual_model = OLLAMA_MODEL
            else:
                actual_model = GEMINI_MODEL

        if type_model == ModelType.GEMINI:
            return ChatGoogleGenerativeAI(
                model=actual_model,
                streaming=True,
                temperature=temp,
                max_tokens=tokens,
                api_key=getattr(settings.llm, "gemini_api_key", ""),
            )
        elif type_model == ModelType.OPENAI:
            return ChatOpenAI(
                model=actual_model,
                streaming=True,
                temperature=temp,
                max_tokens=tokens,
                api_key=getattr(settings.llm, "openai_api_key", ""),
            )
        elif type_model == ModelType.OLLAMA:
            return OllamaLLM(
                model=actual_model,
                temperature=temp,
            )
        else:
            return None

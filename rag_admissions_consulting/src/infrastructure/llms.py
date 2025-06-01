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
)
from config.settings import settings


class LLms:
    @staticmethod
    def getLLm(type_model: ModelType, temperature=None, max_tokens=None):
        """
        Get LLM instance based on model type

        Args:
            type_model: ModelType enum value
            temperature: Optional temperature override
            max_tokens: Optional max_tokens override
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

        if type_model == ModelType.GEMINI:
            return ChatGoogleGenerativeAI(
                model=GEMINI_MODEL,
                streaming=True,
                temperature=temp,
                max_tokens=tokens,
                api_key=getattr(settings.llm, "gemini_api_key", ""),
            )
        elif type_model == ModelType.OPENAI:
            return ChatOpenAI(
                model=OPENAI_MODEL,
                streaming=True,
                temperature=temp,
                max_tokens=tokens,
                api_key=getattr(settings.llm, "openai_api_key", ""),
            )
        elif type_model == ModelType.OLLAMA:
            return OllamaLLM(
                model=OLLAMA_MODEL,
                temperature=temp,
            )
        else:
            return None

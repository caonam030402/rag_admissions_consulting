from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from shared.constant import gemini_model, openai_model
from langchain_ollama.llms import OllamaLLM
from shared.enum import ModelType
from config.settings import settings


class LLms:
    @staticmethod
    def getLLm(type_model: ModelType):
        if type_model == ModelType.GEMINI:
            lmm = ChatGoogleGenerativeAI(
                model=gemini_model,
                streaming=True,
                temperature=settings.llm.temperature,
                api_key=settings.llm.gemini_api_key,
            )
            return lmm
        elif type_model == ModelType.OPENAI:
            lmm = ChatOpenAI(
                model=openai_model,
                streaming=True,
                temperature=settings.llm.temperature,
                api_key=settings.llm.openai_api_key,
            )
            return lmm
        elif type_model == ModelType.OLLAMA:
            lmm = OllamaLLM(
                model="deepseek-r1",
            )
            return lmm
        else:
            return None

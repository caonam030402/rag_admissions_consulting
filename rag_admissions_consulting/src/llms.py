from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from shared.constant import gemini_model, openai_model
from langchain_ollama.llms import OllamaLLM
from shared.enum import ModelType

import sys
sys.path.append("..")
from config import getEnv

class LLms:
    def getLLm(type_model: ModelType):
        if type_model == ModelType.GEMINI:
            lmm = ChatGoogleGenerativeAI(
                    model=gemini_model,
                    streaming=True,
                    temperature=0,
                    api_key=getEnv("GEMINI_API_KEY"),
                )
            return lmm
        elif type_model == ModelType.OPENAI:
            lmm = ChatOpenAI(
                    model=openai_model,
                    streaming=True,
                    temperature=0,
                    api_key=getEnv("OPENAI_API_KEY"),
                )
            return lmm
        elif type_model == ModelType.OLLAMA:
            lmm = OllamaLLM(
                   model="deepseek-r1",
                )
            return lmm
        else:
            return None
        
        
        
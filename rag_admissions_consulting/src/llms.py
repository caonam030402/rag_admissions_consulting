from langchain_openai import OpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from rag_admissions_consulting.src.shared.constant import gemini_model, openai_model
from rag_admissions_consulting.src.shared.enum import ModelType

class LLms:
    def getLLm(type_model: ModelType):
        if type_model == ModelType.GEMINI:
            lmm = ChatGoogleGenerativeAI(
                    model=gemini_model,
                    treaming=True,
                    temperature=0,
                    api_key=GEMINI_API_KEY,
                )
            return lmm
        elif type_model == ModelType.OPENAI:
            lmm = OpenAI(
                    model=openai_model,
                    treaming=True,
                    temperature=0,
                    api_key=GEMINI_API_KEY,
                )
            return lmm
        else:
            return None
        
        
        
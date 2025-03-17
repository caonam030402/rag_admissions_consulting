from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import OpenAI, OpenAIEmbeddings
from shared.enum import ModelType

import sys
sys.path.append("..")
from config import getEnv

class Embeddings:
    EMBEDDING_MODELS = {
        ModelType.HUGGINGFACE: lambda: HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        ),
        ModelType.GEMINI: lambda: GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key= getEnv("GEMINI_API_KEY"),
            task_type="retrieval_document"
        ),
        ModelType.OPENAI: lambda: OpenAIEmbeddings(
            model="text-embedding-3-large"
        )
    }

    def get_embeddings(self, model_name: str):
        return Embeddings.EMBEDDING_MODELS[model_name]()
    

embeddings = Embeddings()
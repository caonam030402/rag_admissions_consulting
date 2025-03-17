from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import OpenAI, OpenAIEmbeddings
from shared.enum import ModelType

class Embeddings:
    EMBEDDING_MODELS = {
        ModelType.HUGGINGFACE: lambda: HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        ),
        ModelType.GEMINI: lambda: GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004"
        ),
        ModelType.OPENAI: lambda: OpenAIEmbeddings(
            model="text-embedding-3-large"
        )
    }

    def get_embeddings(self, model_name: str):
        return Embeddings.EMBEDDING_MODELS[model_name]()
    

embeddings = Embeddings()
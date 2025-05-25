from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_ollama import OllamaEmbeddings
from shared.enum import ModelType
from config.settings import settings


class Embeddings:
    EMBEDDING_MODELS = {
        ModelType.HUGGINGFACE: lambda: HuggingFaceEmbeddings(
            model_name=settings.embedding.model_name,
            cache_folder=settings.embedding.cache_dir,
        ),
        ModelType.GEMINI: lambda: GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=settings.llm.gemini_api_key,
            task_type="retrieval_document",
        ),
        ModelType.OPENAI: lambda: OpenAIEmbeddings(
            model="text-embedding-3-small", api_key=settings.llm.openai_api_key
        ),
        ModelType.OLLAMA: lambda: OllamaEmbeddings(model="nomic-embed-text"),
    }

    def get_embeddings(self, model_name: str):
        return Embeddings.EMBEDDING_MODELS[model_name]()


embeddings = Embeddings()

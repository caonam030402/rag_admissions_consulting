from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_ollama import OllamaEmbeddings
from shared.enum import ModelType
import re
import unicodedata
from typing import List, Dict, Any
import numpy as np

import sys

sys.path.append("..")
from config import getEnv


class TextPreprocessor:
    @staticmethod
    def normalize_text(text: str) -> str:
        """Normalize text by removing extra whitespace, converting to lowercase, etc."""
        # Convert to lowercase and normalize unicode characters
        text = text.lower()
        text = unicodedata.normalize('NFKD', text)
        
        # Remove special characters but keep meaningful punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 512, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks for better context preservation."""
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i + chunk_size])
            chunks.append(chunk)
        
        return chunks


class Embeddings:
    EMBEDDING_MODELS = {
        ModelType.HUGGINGFACE: lambda: HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        ),
        ModelType.GEMINI: lambda: GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=getEnv("GEMINI_API_KEY"),
            task_type="retrieval_document",
        ),
        ModelType.OPENAI: lambda: OpenAIEmbeddings(model="text-embedding-3-small"),
        ModelType.OLLAMA: lambda: OllamaEmbeddings(model="nomic-embed-text"),
    }

    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self._current_model = None
        self.dimension_map = {
            ModelType.HUGGINGFACE: 384,  # all-MiniLM-L6-v2 dimension
            ModelType.GEMINI: 768,
            ModelType.OPENAI: 1536,  # text-embedding-3-small dimension
            ModelType.OLLAMA: 768,
        }

    def preprocess_text(self, text: str, chunk: bool = False) -> List[str]:
        """Preprocess text with optional chunking."""
        normalized_text = self.preprocessor.normalize_text(text)
        if chunk:
            return self.preprocessor.chunk_text(normalized_text)
        return [normalized_text]

    def get_embeddings(self, model_name: str):
        """Get embedding model with caching."""
        if self._current_model is None or self._current_model[0] != model_name:
            self._current_model = (model_name, Embeddings.EMBEDDING_MODELS[model_name]())
        return self._current_model[1]

    async def embed_texts(self, texts: List[str], model_name: str, chunk: bool = False) -> List[List[float]]:
        """Embed multiple texts with preprocessing."""
        processed_texts = []
        for text in texts:
            processed_chunks = self.preprocess_text(text, chunk=chunk)
            processed_texts.extend(processed_chunks)

        embeddings_model = self.get_embeddings(model_name)
        embeddings = await embeddings_model.aembed_documents(processed_texts)
        
        # If chunking was used, aggregate chunk embeddings
        if chunk and len(texts) != len(embeddings):
            return self._aggregate_chunk_embeddings(embeddings, len(texts))
        
        return embeddings

    def _aggregate_chunk_embeddings(self, chunk_embeddings: List[List[float]], num_original_texts: int) -> List[List[float]]:
        """Aggregate chunk embeddings back to original text level using mean pooling."""
        chunk_size = len(chunk_embeddings) // num_original_texts
        aggregated_embeddings = []
        
        for i in range(num_original_texts):
            start_idx = i * chunk_size
            end_idx = start_idx + chunk_size
            chunks = chunk_embeddings[start_idx:end_idx]
            mean_embedding = np.mean(chunks, axis=0).tolist()
            aggregated_embeddings.append(mean_embedding)
        
        return aggregated_embeddings


embeddings = Embeddings()

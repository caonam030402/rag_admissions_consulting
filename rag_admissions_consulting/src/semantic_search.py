from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from loguru import logger
import re
from prompt import create_rewrite_query_prompt
from langchain_core.language_models import BaseLLM
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


@dataclass
class SearchResult:
    content: str
    score: float
    metadata: Dict[str, Any]


class SemanticSearchOptimizer:
    def __init__(self, llm: BaseLLM, embeddings_model):
        self.llm = llm
        self.embeddings_model = embeddings_model
        
    def preprocess_query(self, query: str) -> str:
        """Clean and normalize the query text."""
        # Convert to lowercase
        query = query.lower()
        
        # Normalize whitespace
        query = re.sub(r'\s+', ' ', query)
        
        # Remove special characters but keep meaningful punctuation
        query = re.sub(r'[^\w\s.,?!-]', '', query)
        
        # Expand common Vietnamese abbreviations
        abbreviations = {
            'đh': 'đại học',
            'ts': 'tuyển sinh',
            'sv': 'sinh viên',
            'gv': 'giảng viên',
            'hp': 'học phí',
            'ct': 'chương trình',
            'đt': 'đào tạo',
            'nv': 'nguyện vọng',
            'tc': 'tín chỉ',
        }
        
        for abbr, full in abbreviations.items():
            query = re.sub(r'\b' + abbr + r'\b', full, query)
            
        return query.strip()
    
    async def enhance_query(self, query: str, chat_history: Optional[List[Dict[str, str]]] = None) -> str:
        """Enhance the query using LLM for better semantic matching."""
        # Create prompt for query enhancement
        prompt = create_rewrite_query_prompt(query, chat_history)
        
        # Get enhanced query from LLM
        response = await self.llm.apredict(prompt)
        enhanced_query = response.strip()
        
        logger.info(f"Enhanced query: {query} -> {enhanced_query}")
        return enhanced_query
    
    def calculate_relevance_scores(self, query_embedding: List[float], doc_embeddings: List[List[float]]) -> List[float]:
        """Calculate cosine similarity scores between query and documents."""
        query_embedding = np.array(query_embedding).reshape(1, -1)
        doc_embeddings = np.array(doc_embeddings)
        
        similarities = cosine_similarity(query_embedding, doc_embeddings)[0]
        return similarities.tolist()
    
    def rerank_results(
        self, 
        query: str,
        initial_results: List[SearchResult],
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> List[SearchResult]:
        """Rerank search results based on multiple factors."""
        if not initial_results:
            return []
            
        # Calculate base relevance scores
        query_embedding = self.embeddings_model.embed_query(query)
        doc_embeddings = [
            self.embeddings_model.embed_query(result.content)
            for result in initial_results
        ]
        
        relevance_scores = self.calculate_relevance_scores(query_embedding, doc_embeddings)
        
        # Apply additional ranking factors
        final_scores = []
        for i, (result, relevance) in enumerate(zip(initial_results, relevance_scores)):
            score = relevance
            
            # Boost recent documents
            if 'timestamp' in result.metadata:
                recency_boost = self._calculate_recency_boost(result.metadata['timestamp'])
                score *= (1 + recency_boost)
            
            # Boost based on content quality
            quality_score = self._assess_content_quality(result.content)
            score *= (1 + quality_score)
            
            # Consider chat history if available
            if chat_history:
                context_boost = self._calculate_context_relevance(result.content, chat_history)
                score *= (1 + context_boost)
            
            final_scores.append((i, score))
        
        # Sort by final score and reorder results
        final_scores.sort(key=lambda x: x[1], reverse=True)
        reranked_results = [
            SearchResult(
                content=initial_results[idx].content,
                score=score,
                metadata=initial_results[idx].metadata
            )
            for idx, score in final_scores
        ]
        
        return reranked_results
    
    def _calculate_recency_boost(self, timestamp: str) -> float:
        """Calculate recency boost factor (0 to 0.2)."""
        # Implementation depends on your timestamp format
        # This is a placeholder that returns a small boost
        return 0.1
    
    def _assess_content_quality(self, content: str) -> float:
        """Assess content quality based on various factors (0 to 0.3)."""
        score = 0.0
        
        # Length factor - prefer medium-length content
        length = len(content.split())
        if 50 <= length <= 500:
            score += 0.1
            
        # Structure factor - prefer well-structured content
        if re.search(r'[.!?]\s+[A-Z]', content):  # Proper sentences
            score += 0.1
            
        # Information density - prefer content with numbers, dates, etc.
        if re.search(r'\d', content):  # Contains numbers
            score += 0.1
            
        return score
    
    def _calculate_context_relevance(
        self,
        content: str,
        chat_history: List[Dict[str, str]]
    ) -> float:
        """Calculate relevance to chat history context (0 to 0.2)."""
        if not chat_history:
            return 0.0
            
        # Get recent messages
        recent_messages = chat_history[-3:]
        recent_text = " ".join([
            f"{msg['question']} {msg['answer']}"
            for msg in recent_messages
        ])
        
        # Calculate similarity with recent conversation
        message_embedding = self.embeddings_model.embed_query(recent_text)
        content_embedding = self.embeddings_model.embed_query(content)
        
        similarity = cosine_similarity(
            np.array(message_embedding).reshape(1, -1),
            np.array(content_embedding).reshape(1, -1)
        )[0][0]
        
        # Convert to boost factor (0 to 0.2)
        return min(similarity * 0.2, 0.2) 
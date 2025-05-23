from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from prompt import system_prompt
from langchain import hub
from functools import lru_cache
from loguru import logger
from ood_agent import OODAgent
from shared.conversation_memory import ConversationMemory
from typing import List, Dict, Any, Optional, Tuple
import numpy as np

# Simple in-memory cache for responses
response_cache = {}


class RagAgent:
    def __init__(self, llm, retriever, ood_agent: Optional[OODAgent] = None):
        self.llm = llm
        self.retriever = retriever
        self.ood_agent = ood_agent
        self.conversation_memories: Dict[str, ConversationMemory] = {}
        self.response_cache = {}
        
    def get_or_create_memory(self, user_id: str) -> ConversationMemory:
        """Get or create a conversation memory for a user."""
        if user_id not in self.conversation_memories:
            self.conversation_memories[user_id] = ConversationMemory(user_id=user_id)
        return self.conversation_memories[user_id]

    def create_enhanced_prompt(self, question: str, memory: ConversationMemory) -> str:
        """Create an enhanced prompt using conversation context and user preferences."""
        recent_context = memory.get_formatted_history()
        user_preferences = memory.user_preferences
        
        # Build context-aware prompt
        context_parts = []
        if recent_context:
            context_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in recent_context[-3:]])
            context_parts.append(f"Recent conversation:\n{context_str}")
            
        if user_preferences:
            pref_str = "\n".join([f"{k}: {v}" for k, v in user_preferences.items()])
            context_parts.append(f"User preferences:\n{pref_str}")
            
        context = "\n\n".join(context_parts)
        
        # Combine with original question
        if context:
            return f"{context}\n\nCurrent question: {question}"
        return question

    def enhance_retrieval(self, question: str, memory: ConversationMemory) -> List[Dict]:
        """Enhance retrieval by considering conversation context."""
        # Get recent relevant context
        recent_messages = memory.get_recent_messages(3)
        relevant_context = [msg.content for msg in recent_messages if msg.role == "human"]
        
        # Perform retrieval for both current question and context
        all_docs = []
        
        # Retrieve for current question
        current_docs = self.retriever.get_relevant_documents(question)
        all_docs.extend(current_docs)
        
        # Retrieve for context if available
        for context in relevant_context:
            context_docs = self.retriever.get_relevant_documents(context)
            all_docs.extend(context_docs)
            
        # Remove duplicates and sort by relevance
        unique_docs = self._deduplicate_documents(all_docs)
        return unique_docs

    def _deduplicate_documents(self, docs: List[Dict]) -> List[Dict]:
        """Remove duplicate documents and sort by relevance."""
        seen_contents = set()
        unique_docs = []
        
        for doc in docs:
            content_hash = hash(doc.page_content)
            if content_hash not in seen_contents:
                seen_contents.add(content_hash)
                unique_docs.append(doc)
                
        return unique_docs[:5]  # Return top 5 most relevant docs

    def rag_chain(self):
        """Create RAG chain with enhanced prompt template."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("system", "Here is relevant information from the knowledge base:\n\n{context}"),
            ("system", "Recent conversation and user preferences:\n\n{chat_history}"),
            ("human", "{input}")
        ])
        
        question_answer_chain = create_stuff_documents_chain(self.llm, prompt)
        rag_chain = create_retrieval_chain(self.retriever, question_answer_chain)
        return rag_chain

    async def answer_question_stream(
        self,
        question: str,
        user_id: str,
        metadata: Dict[str, Any] = None
    ):
        """Stream responses with enhanced context awareness."""
        logger.info(f"Processing question for user {user_id}: {question[:50]}...")
        
        # Get or create conversation memory
        memory = self.get_or_create_memory(user_id)
        
        # Add the current question to memory
        memory.add_message("human", question, metadata)
        
        # Check if this is a follow-up question
        is_followup = self.is_simple_followup(question)
        
        try:
            # Enhanced retrieval
            docs = self.enhance_retrieval(question, memory)
            
            # OOD detection (skip for follow-ups)
            if self.ood_agent and not is_followup:
                is_ood, explanation = self.ood_agent.is_out_of_domain(question, docs)
                if is_ood:
                    ood_response = self.ood_agent.get_ood_response(question)
                    memory.add_message("assistant", ood_response)
                    for token in ood_response:
                        yield token
                    return
            
            # Create enhanced prompt
            enhanced_question = self.create_enhanced_prompt(question, memory)
            
            # Get RAG chain response
            rag_chain = self.rag_chain()
            response_tokens = []
            
            async for token in rag_chain.astream({
                "input": enhanced_question,
                "chat_history": memory.get_formatted_history()
            }):
                if "answer" in token:
                    response_tokens.append(token["answer"])
                    yield token["answer"]
            
            # Add response to memory
            full_response = "".join(response_tokens)
            memory.add_message("assistant", full_response)
            
        except Exception as e:
            logger.error(f"Error in streaming response: {str(e)}")
            error_msg = "Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn."
            memory.add_message("assistant", error_msg)
            yield error_msg

    @staticmethod
    def is_simple_followup(question: str) -> bool:
        """Check if question appears to be a simple follow-up question"""
        question = question.lower().strip()

        # Vietnamese follow-up patterns
        followup_starters = [
            "còn",
            "vậy còn",
            "thế còn",
            "thế",
            "vậy",
            "thế còn",
            "và",
            "còn về",
            "tại sao",
            "vì sao",
            "sao",
            "tại",
            # Short questions
            "như thế nào",
            "khi nào",
            "bao nhiêu",
            "mấy giờ",
            "ai",
            "ở đâu",
            "gì",
            # Single-word queries that need context
            "ok",
            "ừ",
            "vâng",
            "rồi",
            "được",
            "xong",
        ]

        for starter in followup_starters:
            if question.startswith(starter) or question == starter:
                return True

        # If very short, likely a follow-up
        return len(question.split()) <= 3

    def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> None:
        """Update user preferences for personalization."""
        memory = self.get_or_create_memory(user_id)
        memory.update_user_preferences(preferences)

    def save_conversation_state(self, user_id: str, filepath: str) -> None:
        """Save conversation state to file."""
        if user_id in self.conversation_memories:
            self.conversation_memories[user_id].save_to_file(filepath)

    def load_conversation_state(self, filepath: str) -> str:
        """Load conversation state from file and return user_id."""
        memory = ConversationMemory.load_from_file(filepath)
        if memory.user_id:
            self.conversation_memories[memory.user_id] = memory
            return memory.user_id
        return None

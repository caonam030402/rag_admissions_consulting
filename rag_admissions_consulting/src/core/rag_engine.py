from typing import List, Dict, Any, AsyncGenerator, Optional
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
import asyncio

from infrastructure.llms import LLms
from infrastructure.store import store
from infrastructure.embeddings import embeddings
from shared.enum import ModelType
from shared.constant import (
    MODEL_TYPE_MAPPING,
    DEFAULT_LLM_MODEL,
    DEFAULT_LLM_TEMPERATURE,
    DEFAULT_LLM_MAX_TOKENS,
)
from core.prompt_engine import PromptEngine
from core.query_analyzer import QueryAnalyzer
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI


class RagEngine:
    """Intelligent RAG engine with context awareness and optimized responses"""

    def __init__(
        self,
        llm=None,
        retriever=None,
        vector_store: Chroma = None,
        settings=None,
    ):
        self.vector_store = vector_store
        self.retriever = retriever
        self.settings = settings

        # Initialize LLM with settings
        self.llm = llm or self._initialize_llm()

        # Initialize components with settings
        self.prompt_engine = PromptEngine(settings=self.settings)
        self.query_analyzer = QueryAnalyzer()

        # If no retriever provided, try to create one
        if self.retriever is None and self.vector_store is not None:
            self._initialize_retriever()

        logger.info("✅ RAG Engine initialized with intelligent components")

    def _initialize_llm(self):
        """Initialize LLM based on settings configuration"""

        # Default values from constants
        default_model = DEFAULT_LLM_MODEL
        max_tokens = DEFAULT_LLM_MAX_TOKENS
        temperature = DEFAULT_LLM_TEMPERATURE

        # Use settings if available
        if self.settings:
            default_model = getattr(self.settings.llm, "default_model", default_model)
            max_tokens = getattr(self.settings.llm, "max_tokens", max_tokens)
            temperature = getattr(self.settings.llm, "temperature", temperature)

            logger.info(
                f"🤖 Using LLM config from settings: {default_model}, tokens: {max_tokens}, temp: {temperature}"
            )

        # Get the appropriate ModelType using constants
        model_type = MODEL_TYPE_MAPPING.get(default_model, ModelType.GEMINI)

        logger.info(f"🤖 Mapped {default_model} -> {model_type}")

        # Use LLms factory to get the LLM
        try:
            llm = LLms.getLLm(
                model_type, temperature=temperature, max_tokens=max_tokens
            )
            if llm is not None:
                logger.info(
                    f"✅ Successfully initialized LLM: {model_type} (temp: {temperature}, tokens: {max_tokens})"
                )
                return llm
            else:
                logger.error(f"❌ Failed to get LLM for type: {model_type}")
                # Fallback to default GEMINI
                return LLms.getLLm(
                    ModelType.GEMINI, temperature=temperature, max_tokens=max_tokens
                )
        except Exception as e:
            logger.error(f"❌ Error initializing LLM: {e}")
            # Fallback to default GEMINI
            return LLms.getLLm(
                ModelType.GEMINI, temperature=temperature, max_tokens=max_tokens
            )

    def set_retriever(self, retriever):
        """Set the retriever for the RAG engine"""
        self.retriever = retriever
        logger.info("✅ Retriever updated in RAG engine")

    def set_vector_store(self, vector_store: Chroma):
        """Set the vector store for the RAG engine"""
        self.vector_store = vector_store
        logger.info("✅ Vector store updated in RAG engine")

    def update_llm_settings(self):
        """Update LLM settings from backend config"""
        if self.settings:
            self.llm = self._initialize_llm()
            logger.info("🔄 LLM settings updated from backend config")

    def _components_provided(self) -> bool:
        """Check if all required components are provided"""
        return (
            self.llm is not None
            and self.embedding_model is not None
            and self.vector_store is not None
        )

    def _setup_with_provided_components(self):
        """Setup RAG engine with pre-initialized components"""
        try:
            logger.info("Setting up RAG engine with pre-initialized components...")

            # Setup retriever with provided components
            self.retriever = self.vector_store.getRetriever(self.embedding_model)

            logger.info("RAG engine setup completed with pre-initialized components")

        except Exception as e:
            logger.error(f"Error setting up RAG engine with provided components: {e}")
            # Fallback to normal initialization
            self._initialize_components()

    def _initialize_components(self):
        """Initialize LLM and retriever components from scratch"""
        try:
            logger.info("Initializing RAG engine components from scratch...")

            # Initialize LLM if not provided
            if self.llm is None:
                self.llm = LLms.getLLm(ModelType.GEMINI)

            # Initialize embeddings and retriever if not provided
            if self.embedding_model is None:
                self.embedding_model = embeddings.get_embeddings(ModelType.HUGGINGFACE)

            if self.vector_store is None:
                self.vector_store = store

            self.retriever = self.vector_store.getRetriever(self.embedding_model)

            logger.info("RAG engine components initialized successfully")

        except Exception as e:
            logger.error(f"Error initializing RAG engine: {e}")
            raise

    async def generate_response_stream(
        self,
        query: str,
        original_query: str,
        context_messages: List[Dict[str, Any]] = None,
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response with intelligent context awareness"""

        try:
            # Analyze query intent and type
            query_analysis = await self.query_analyzer.analyze_query(
                original_query, context_messages
            )

            # Get relevant documents with enhanced retrieval
            relevant_docs = await self._enhanced_retrieval(query, query_analysis)

            # Create context-aware prompt
            prompt = self.prompt_engine.create_context_aware_prompt(
                query=original_query,
                enhanced_query=query,
                context_messages=context_messages,
                query_analysis=query_analysis,
                relevant_docs=relevant_docs,
            )

            # Create RAG chain
            rag_chain = self._create_rag_chain(prompt)

            logger.info(
                f"Generating response for query type: {query_analysis.get('type', 'general')}"
            )

            # Stream response
            response_tokens = []
            async for token in rag_chain.astream(
                {
                    "input": original_query,
                    "context": self._format_documents(relevant_docs),
                    "chat_history": self._format_chat_history(context_messages or []),
                }
            ):
                if "answer" in token:
                    response_tokens.append(token["answer"])
                    yield token["answer"]

            logger.info(
                f"Response generation completed. Tokens: {len(response_tokens)}"
            )

        except Exception as e:
            logger.error(f"Error in generate_response_stream: {e}")
            error_message = (
                "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau."
            )
            yield error_message

    def _initialize_retriever(self):
        """Initialize retriever if not provided"""
        try:
            from infrastructure.embeddings import embeddings
            from shared.enum import ModelType

            logger.info("🔧 Initializing retriever on demand...")
            embedding_model = embeddings.get_embeddings(ModelType.HUGGINGFACE)
            self.retriever = self.vector_store.getRetriever(embedding_model)
            logger.info("✅ Retriever initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize retriever: {e}")
            self.retriever = None

    async def _enhanced_retrieval(
        self, query: str, query_analysis: Dict[str, Any]
    ) -> List[Any]:
        """Enhanced document retrieval based on query analysis"""
        try:
            # Check if retriever is available
            if self.retriever is None:
                logger.warning("No retriever available, attempting to initialize...")
                self._initialize_retriever()

            if self.retriever is None:
                logger.error("Retriever still not available, returning empty results")
                return []

            # Get base relevant documents
            docs = self.retriever.get_relevant_documents(query)

            # Log retrieval results
            logger.info(f"Retrieved {len(docs)} documents for query")
            for i, doc in enumerate(docs[:3]):  # Log first 3 docs
                logger.debug(f"Doc {i+1}: {doc.page_content[:100]}...")

            # Apply query-specific filtering and ranking
            if query_analysis.get("type") == "specific_program":
                docs = self._filter_program_specific_docs(docs, query_analysis)
            elif query_analysis.get("type") == "admission_process":
                docs = self._filter_admission_process_docs(docs, query_analysis)
            elif query_analysis.get("type") == "fees_scholarships":
                docs = self._filter_financial_docs(docs, query_analysis)

            return docs[:5]  # Return top 5 most relevant

        except Exception as e:
            logger.error(f"Error in enhanced retrieval: {e}")
            return []

    def _filter_program_specific_docs(
        self, docs: List[Any], query_analysis: Dict[str, Any]
    ) -> List[Any]:
        """Filter documents for program-specific queries"""
        # Implement program-specific filtering logic
        return docs

    def _filter_admission_process_docs(
        self, docs: List[Any], query_analysis: Dict[str, Any]
    ) -> List[Any]:
        """Filter documents for admission process queries"""
        # Implement admission process filtering logic
        return docs

    def _filter_financial_docs(
        self, docs: List[Any], query_analysis: Dict[str, Any]
    ) -> List[Any]:
        """Filter documents for financial information queries"""
        # Implement financial information filtering logic
        return docs

    def _create_rag_chain(self, prompt: ChatPromptTemplate):
        """Create RAG chain with the given prompt"""
        try:
            question_answer_chain = create_stuff_documents_chain(self.llm, prompt)

            # Check if retriever is available
            if self.retriever is None:
                logger.warning(
                    "No retriever available for RAG chain, attempting to initialize..."
                )
                self._initialize_retriever()

            if self.retriever is None:
                logger.error("Cannot create RAG chain without retriever")
                # Return a simple chain that just uses the LLM
                from langchain_core.prompts import ChatPromptTemplate
                from langchain_core.output_parsers import StrOutputParser

                simple_prompt = ChatPromptTemplate.from_messages(
                    [
                        (
                            "system",
                            "You are a helpful assistant. Answer the question based on your knowledge.",
                        ),
                        ("human", "{input}"),
                    ]
                )
                return simple_prompt | self.llm | StrOutputParser()

            rag_chain = create_retrieval_chain(self.retriever, question_answer_chain)
            return rag_chain
        except Exception as e:
            logger.error(f"Error creating RAG chain: {e}")
            # Fallback to simple LLM chain
            from langchain_core.prompts import ChatPromptTemplate
            from langchain_core.output_parsers import StrOutputParser

            simple_prompt = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        "You are a helpful assistant. Answer the question based on your knowledge.",
                    ),
                    ("human", "{input}"),
                ]
            )
            return simple_prompt | self.llm | StrOutputParser()

    def _format_documents(self, docs: List[Any]) -> str:
        """Format retrieved documents for context"""
        if not docs:
            return "Không tìm thấy thông tin liên quan trong cơ sở dữ liệu."

        formatted_docs = []
        for i, doc in enumerate(docs, 1):
            content = doc.page_content.strip()
            metadata = doc.metadata

            doc_info = f"Tài liệu {i}:\n{content}"
            if metadata:
                doc_info += f"\n(Nguồn: {metadata.get('source', 'Không xác định')})"

            formatted_docs.append(doc_info)

        return "\n\n".join(formatted_docs)

    def _format_chat_history(
        self, context_messages: List[Dict[str, Any]]
    ) -> List[tuple]:
        """Format chat history for the RAG chain"""
        formatted_history = []
        for msg in context_messages:
            role = "human" if msg["role"] == "USER" else "assistant"
            formatted_history.append((role, msg["content"]))
        return formatted_history

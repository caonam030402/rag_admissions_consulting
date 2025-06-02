import asyncio
from typing import Dict, Any, Optional
from loguru import logger
import time

from core.rag_engine import RagEngine
from core.query_analyzer import QueryAnalyzer
from core.prompt_engine import PromptEngine
from infrastructure.embeddings import embeddings
from infrastructure.store import store
from infrastructure.llms import LLms
from shared.enum import ModelType
from config.settings import settings, initialize_settings_with_backend


class ApplicationManager:
    """Quản lý khởi tạo và cache các thành phần của ứng dụng"""

    _instance: Optional["ApplicationManager"] = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.components: Dict[str, Any] = {}
            self.initialization_times: Dict[str, float] = {}
            self._initialized = True

    async def initialize_all_components(self):
        """Khởi tạo tất cả các thành phần cần thiết"""
        logger.info("🚀 Bắt đầu khởi tạo tất cả thành phần...")

        start_time = time.time()

        try:
            # 0. Load configuration from backend first
            await self._initialize_backend_config()

            # 1. Khởi tạo Embedding Model
            await self._initialize_embedding_model()

            # 2. Khởi tạo Vector Store
            await self._initialize_vector_store()

            # 3. Khởi tạo LLM Model
            await self._initialize_llm_model()

            # 4. Khởi tạo Query Analyzer
            await self._initialize_query_analyzer()

            # 5. Khởi tạo Prompt Engine
            await self._initialize_prompt_engine()

            # 6. Khởi tạo RAG Engine
            await self._initialize_rag_engine()

            total_time = time.time() - start_time
            logger.info(
                f"✅ Hoàn thành khởi tạo tất cả thành phần trong {total_time:.2f}s"
            )

            # Log thời gian khởi tạo từng thành phần
            for component, init_time in self.initialization_times.items():
                logger.info(f"  - {component}: {init_time:.2f}s")

        except Exception as e:
            logger.error(f"❌ Lỗi khi khởi tạo thành phần: {e}")
            raise

    async def _initialize_backend_config(self):
        """Load configuration from backend API"""
        start_time = time.time()
        try:
            logger.info("⚙️ Loading configuration from backend...")
            await initialize_settings_with_backend()

            self.components["backend_config"] = "loaded"
            self.initialization_times["backend_config"] = time.time() - start_time
            logger.info("✅ Backend configuration loaded successfully")

        except Exception as e:
            logger.warning(
                f"⚠️ Backend config loading failed: {e}, continuing with defaults"
            )
            self.components["backend_config"] = "failed"
            self.initialization_times["backend_config"] = time.time() - start_time

    async def _initialize_embedding_model(self):
        """Khởi tạo Embedding Model"""
        start_time = time.time()
        try:
            logger.info("📝 Khởi tạo Embedding Model...")
            embedding_model = embeddings.get_embeddings(ModelType.HUGGINGFACE)

            # Test embedding để đảm bảo model hoạt động
            test_text = "Test embedding"
            await asyncio.to_thread(embedding_model.embed_query, test_text)

            self.components["embedding_model"] = embedding_model
            self.initialization_times["embedding_model"] = time.time() - start_time
            logger.info("✅ Embedding Model đã sẵn sàng")

        except Exception as e:
            logger.error(f"❌ Lỗi khởi tạo Embedding Model: {e}")
            raise

    async def _initialize_vector_store(self):
        """Khởi tạo Vector Store"""
        start_time = time.time()
        try:
            logger.info("🗄️ Khởi tạo Vector Store...")
            # Initialize store connection
            await asyncio.to_thread(store.initStore)

            self.components["vector_store"] = store
            self.initialization_times["vector_store"] = time.time() - start_time
            logger.info("✅ Vector Store đã sẵn sàng")

        except Exception as e:
            logger.error(f"❌ Lỗi khởi tạo Vector Store: {e}")
            raise

    async def _initialize_llm_model(self):
        """Khởi tạo LLM Model"""
        start_time = time.time()
        try:
            logger.info("🤖 Khởi tạo LLM Model...")
            llm_model = LLms.getLLm(ModelType.GEMINI)

            # Test LLM với câu hỏi đơn giản
            test_prompt = "Xin chào"
            response = await asyncio.to_thread(llm_model.invoke, test_prompt)
            logger.debug(f"LLM test response: {str(response)[:50]}...")

            self.components["llm_model"] = llm_model
            self.initialization_times["llm_model"] = time.time() - start_time
            logger.info("✅ LLM Model đã sẵn sàng")

        except Exception as e:
            logger.error(f"❌ Lỗi khởi tạo LLM Model: {e}")
            raise

    async def _initialize_query_analyzer(self):
        """Khởi tạo Query Analyzer"""
        start_time = time.time()
        try:
            logger.info("🔍 Khởi tạo Query Analyzer...")
            query_analyzer = QueryAnalyzer()

            self.components["query_analyzer"] = query_analyzer
            self.initialization_times["query_analyzer"] = time.time() - start_time
            logger.info("✅ Query Analyzer đã sẵn sàng")

        except Exception as e:
            logger.error(f"❌ Lỗi khởi tạo Query Analyzer: {e}")
            raise

    async def _initialize_prompt_engine(self):
        """Khởi tạo Prompt Engine"""
        start_time = time.time()
        try:
            logger.info("📋 Khởi tạo Prompt Engine...")
            prompt_engine = PromptEngine()

            self.components["prompt_engine"] = prompt_engine
            self.initialization_times["prompt_engine"] = time.time() - start_time
            logger.info("✅ Prompt Engine đã sẵn sàng")

        except Exception as e:
            logger.error(f"❌ Lỗi khởi tạo Prompt Engine: {e}")
            raise

    async def _initialize_rag_engine(self):
        """Khởi tạo RAG Engine"""
        start_time = time.time()
        try:
            logger.info("⚙️ Khởi tạo RAG Engine...")
            rag_engine = RagEngine(
                embedding_model=self.components["embedding_model"],
                vector_store=self.components["vector_store"],
                llm_model=self.components["llm_model"],
                query_analyzer=self.components["query_analyzer"],
                prompt_engine=self.components["prompt_engine"],
            )

            self.components["rag_engine"] = rag_engine
            self.initialization_times["rag_engine"] = time.time() - start_time
            logger.info("✅ RAG Engine đã sẵn sàng")

        except Exception as e:
            logger.error(f"❌ Lỗi khởi tạo RAG Engine: {e}")
            raise

    def get_component(self, component_name: str) -> Any:
        """Lấy thành phần đã được khởi tạo"""
        if component_name not in self.components:
            raise ValueError(f"Component '{component_name}' chưa được khởi tạo")
        return self.components[component_name]

    def get_rag_engine(self) -> RagEngine:
        """Lấy RAG Engine đã được khởi tạo"""
        return self.get_component("rag_engine")

    def is_initialized(self) -> bool:
        """Kiểm tra xem tất cả thành phần đã được khởi tạo chưa"""
        required_components = [
            "backend_config",
            "embedding_model",
            "vector_store",
            "llm_model",
            "query_analyzer",
            "prompt_engine",
            "rag_engine",
        ]
        return all(comp in self.components for comp in required_components)

    def get_status(self) -> Dict[str, Any]:
        """Lấy trạng thái của tất cả thành phần"""
        return {
            "initialized": self.is_initialized(),
            "components": list(self.components.keys()),
            "initialization_times": self.initialization_times,
            "total_components": len(self.components),
        }


# Global instance
app_manager = ApplicationManager()

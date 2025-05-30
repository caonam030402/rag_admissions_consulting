from pinecone.grpc import PineconeGRPC as Pinecone
from pinecone import ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from loguru import logger
from config.settings import settings


class Store:
    def __init__(
        self,
        index_name: str = None,
        search_kwargs: dict = None,
        search_type: str = "mmr",
    ):
        self.index_name = index_name or settings.vector_store.index_name
        self.search_kwargs = search_kwargs or {
            "k": settings.vector_store.top_k,
            "fetch_k": 20,  # lấy trước 20 rồi chọn ra 5 kết quả đa dạng nhất
            "lambda_mult": 0.5,  # 0.0: ưu tiên đa dạng, 1.0: ưu tiên liên quan
        }
        self.search_type = search_type
        self.is_connected = False
        logger.info(
            f"Store initialized with index_name={self.index_name}, search_kwargs={self.search_kwargs}"
        )

    def initStore(self):
        try:
            logger.info("Connecting to Pinecone...")
            pc = Pinecone(api_key=settings.vector_store.pinecone_api_key)
            pc.Index(self.index_name)
            self.is_connected = True
            logger.info(f"Successfully connected to Pinecone index '{self.index_name}'")
        except Exception as e:
            logger.error(f"Failed to connect to Pinecone: {e}")
            self.is_connected = False
            raise

    def uploadToStore(self, text_chunks: str, embeddings):
        try:
            logger.info(f"Uploading {len(text_chunks)} chunks to Pinecone...")
            docsearch = PineconeVectorStore.from_documents(
                documents=text_chunks, index_name=self.index_name, embedding=embeddings
            )
            logger.info("Upload to Pinecone completed successfully")
            return docsearch
        except Exception as e:
            logger.error(f"Error uploading to Pinecone: {e}")
            raise

    def getStore(self, embeddings):
        try:
            logger.info(f"Getting store from Pinecone index '{self.index_name}'...")
            store = PineconeVectorStore.from_existing_index(
                index_name=self.index_name, embedding=embeddings, text_key="text"
            )
            logger.info("Successfully retrieved Pinecone store")
            return store
        except Exception as e:
            logger.error(f"Error getting Pinecone store: {e}")
            raise

    def getRetriever(self, embeddings):
        try:
            logger.info(
                f"Creating retriever from Pinecone index '{self.index_name}'..."
            )
            docsearch = PineconeVectorStore.from_existing_index(
                index_name=self.index_name, embedding=embeddings, text_key="text"
            )
            retriever = docsearch.as_retriever(
                search_type=self.search_type, search_kwargs=self.search_kwargs
            )
            logger.info(
                f"Successfully created retriever with search_kwargs={self.search_kwargs}"
            )
            return retriever
        except Exception as e:
            logger.error(f"Error creating retriever from Pinecone: {e}")
            logger.error(
                "This may mean the database doesn't contain relevant documents"
            )
            # Return a dummy retriever that returns no results
            from langchain_core.retrievers import BaseRetriever
            from langchain_core.documents import Document
            from typing import List

            class EmptyRetriever(BaseRetriever):
                def _get_relevant_documents(self, query: str) -> List[Document]:
                    logger.warning(f"Using empty retriever for query: {query}")
                    return []

            logger.warning("Returning empty retriever as fallback")
            return EmptyRetriever()


store = Store()

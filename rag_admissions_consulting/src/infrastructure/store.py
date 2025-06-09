from pinecone.grpc import PineconeGRPC as Pinecone
from pinecone import ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from loguru import logger
from config.settings import settings
import time
import math


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

    def uploadToStore(
        self, text_chunks: str, embeddings, batch_size: int = 10, max_retries: int = 3
    ):
        try:
            total_chunks = len(text_chunks)
            logger.info(
                f"Uploading {total_chunks} chunks to Pinecone in batches of {batch_size}..."
            )

            # Process in batches to avoid rate limiting
            total_batches = math.ceil(total_chunks / batch_size)
            uploaded_count = 0

            for batch_idx in range(total_batches):
                start_idx = batch_idx * batch_size
                end_idx = min(start_idx + batch_size, total_chunks)
                batch_chunks = text_chunks[start_idx:end_idx]

                logger.info(
                    f"Processing batch {batch_idx + 1}/{total_batches} ({len(batch_chunks)} chunks)"
                )

                # Retry logic for each batch
                for attempt in range(max_retries):
                    try:
                        if batch_idx == 0 and attempt == 0:
                            # First batch - create new vector store
                            docsearch = PineconeVectorStore.from_documents(
                                documents=batch_chunks,
                                index_name=self.index_name,
                                embedding=embeddings,
                            )
                        else:
                            # Subsequent batches - add to existing vector store
                            docsearch = PineconeVectorStore.from_existing_index(
                                index_name=self.index_name, embedding=embeddings
                            )
                            docsearch.add_documents(batch_chunks)

                        uploaded_count += len(batch_chunks)
                        logger.info(
                            f"✅ Batch {batch_idx + 1} uploaded successfully ({uploaded_count}/{total_chunks} total)"
                        )
                        break

                    except Exception as batch_error:
                        logger.warning(
                            f"Batch {batch_idx + 1} attempt {attempt + 1} failed: {batch_error}"
                        )
                        if attempt == max_retries - 1:
                            raise Exception(
                                f"Failed to upload batch {batch_idx + 1} after {max_retries} attempts: {batch_error}"
                            )

                        # Wait before retry (exponential backoff)
                        wait_time = 2**attempt
                        logger.info(f"Waiting {wait_time}s before retry...")
                        time.sleep(wait_time)

                # Wait between batches to respect rate limits
                if batch_idx < total_batches - 1:  # Don't wait after last batch
                    logger.info("Waiting 2s between batches to respect rate limits...")
                    time.sleep(2)

            logger.success(
                f"✅ All {uploaded_count} chunks uploaded to Pinecone successfully!"
            )
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

from pinecone.grpc import PineconeGRPC as Pinecone
from pinecone import ServerlessSpec
import sys

sys.path.append("..")
from config import getEnv
from langchain_pinecone import PineconeVectorStore
from loguru import logger
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document
from typing import List, Dict, Any


class Store:
    def __init__(
        self,
        index_name: str = "test2",
        search_kwargs: str = {"k": 3},
        search_type: str = "similarity",
    ):
        self.search_kwargs = search_kwargs
        self.search_type = search_type
        self.index_name = index_name
        self.is_connected = False
        logger.info(
            f"Store initialized with index_name={index_name}, search_kwargs={search_kwargs}"
        )

    def initStore(self):
        try:
            logger.info("Connecting to Pinecone...")
            pc = Pinecone(api_key=getEnv("PINECONE_API_KEY"))
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

            # Create a custom retriever that includes similarity scores
            class ScoredRetriever(BaseRetriever):
                def __init__(self, store, search_kwargs, search_type):
                    self.store = store
                    self.search_kwargs = search_kwargs
                    self.search_type = search_type

                def _get_relevant_documents(self, query: str) -> List[Document]:
                    # Get documents with scores
                    results_with_scores = self.store.similarity_search_with_score(
                        query, **self.search_kwargs
                    )

                    # Convert to Document objects with scores in metadata
                    documents = []
                    for doc, score in results_with_scores:
                        # Add the score to the document's metadata
                        doc.metadata["score"] = float(score)
                        documents.append(doc)

                    return documents

            # Create and return the custom retriever
            retriever = ScoredRetriever(
                store=docsearch,
                search_kwargs=self.search_kwargs,
                search_type=self.search_type,
            )

            logger.info(
                f"Successfully created scored retriever with search_kwargs={self.search_kwargs}"
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

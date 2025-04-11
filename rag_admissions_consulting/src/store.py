from pinecone.grpc import PineconeGRPC as Pinecone
from pinecone import ServerlessSpec
import sys
sys.path.append("..")
from config import getEnv
from langchain_pinecone import PineconeVectorStore

class Store:
    def __init__(self, index_name: str = "test2", search_kwargs: str = {"k": 3}, search_type: str = "similarity"):
        self.search_kwargs = search_kwargs
        self.search_type = search_type
        self.index_name = index_name
        
    def initStore(self):
        pc = Pinecone(api_key=getEnv("PINECONE_API_KEY"))
        pc.Index(self.index_name)
        
    def uploadToStore(self, text_chunks: str, embeddings):
        docsearch = PineconeVectorStore.from_documents(
            documents=text_chunks,
            index_name=self.index_name,
            embedding=embeddings
        )
        return docsearch
    
    def getStore(self, embeddings):
        store = PineconeVectorStore.from_existing_index(index_name=self.index_name, embedding=embeddings)
        return store
    
    def getRetriever(self, embeddings):
        docsearch = PineconeVectorStore.from_existing_index(index_name=self.index_name, embedding=embeddings)
        retriever = docsearch.as_retriever(search_type=self.search_type, search_kwargs=self.search_kwargs)
        return retriever
        
store = Store()
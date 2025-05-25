# Infrastructure Components

Folder này chứa các component cơ sở hạ tầng cho hệ thống RAG.

## 📁 Components

### `embeddings.py`
- **Mục đích**: Quản lý các embedding models
- **Models hỗ trợ**: HuggingFace, OpenAI, Google
- **Usage**: `embeddings.get_embeddings(ModelType.HUGGINGFACE)`

### `llms.py`
- **Mục đích**: Quản lý các language models
- **Models hỗ trợ**: Gemini, OpenAI, Claude
- **Usage**: `LLms.getLLm(ModelType.GEMINI)`

### `store.py`
- **Mục đích**: Quản lý vector store (Pinecone)
- **Chức năng**: Upload, retrieve, search vectors
- **Usage**: `store.getRetriever(embeddings_model)`

## 🔧 Configuration

Tất cả components được cấu hình qua `config/settings.py`:

```python
from config.settings import settings

# Embedding config
embedding_model = settings.embedding.model_name

# LLM config
llm_api_key = settings.llm.gemini_api_key

# Vector store config
pinecone_api_key = settings.vector_store.pinecone_api_key
```

## 🚀 Usage Examples

```python
from infrastructure.embeddings import embeddings
from infrastructure.llms import LLms
from infrastructure.store import store
from shared.enum import ModelType

# Initialize components
embedding_model = embeddings.get_embeddings(ModelType.HUGGINGFACE)
llm = LLms.getLLm(ModelType.GEMINI)
retriever = store.getRetriever(embedding_model)

# Use in RAG pipeline
docs = retriever.get_relevant_documents("query")
response = llm.invoke("prompt")
``` 
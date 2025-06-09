#!/usr/bin/env python3
"""Debug script to test Pinecone connection and upload"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from loguru import logger
from infrastructure import store, embeddings
from data_pipeline.utils.enums import ModelType
from langchain.schema import Document


def test_pinecone_connection():
    """Test basic Pinecone connection"""
    try:
        logger.info("🧪 Testing Pinecone connection...")
        store.initStore()
        logger.success("✅ Pinecone connection successful")
        return True
    except Exception as e:
        logger.error(f"❌ Pinecone connection failed: {e}")
        return False


def test_small_upload():
    """Test uploading a small batch to Pinecone"""
    try:
        logger.info("🧪 Testing small batch upload...")

        # Create small test documents
        test_docs = [
            Document(
                page_content="Test document 1",
                metadata={"source": "test", "chunk_index": 0},
            ),
            Document(
                page_content="Test document 2",
                metadata={"source": "test", "chunk_index": 1},
            ),
        ]

        # Get embeddings model
        logger.info("🔧 Loading embeddings model...")
        embeddings_model = embeddings.get_embeddings(ModelType.HUGGINGFACE)
        logger.info("✅ Embeddings model loaded")

        # Upload test batch
        logger.info("📤 Uploading test batch...")
        store.uploadToStore(test_docs, embeddings_model)
        logger.success("✅ Small batch upload successful")
        return True

    except Exception as e:
        logger.error(f"❌ Small batch upload failed: {e}")
        import traceback

        logger.error(f"Traceback: {traceback.format_exc()}")
        return False


def main():
    logger.info("🚀 Starting Pinecone debug tests...")

    # Test 1: Connection
    if not test_pinecone_connection():
        logger.error("❌ Basic connection failed, stopping tests")
        return

    # Test 2: Small upload
    if not test_small_upload():
        logger.error("❌ Small upload failed")
        return

    logger.success("✅ All tests passed!")


if __name__ == "__main__":
    main()

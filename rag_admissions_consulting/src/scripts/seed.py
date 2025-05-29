#!/usr/bin/env python3
"""
Vector Store Seeding for RAG Admissions Consulting
Uploads processed data to Pinecone vector store
"""

import sys
import os
import csv
from pathlib import Path
from loguru import logger

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from infrastructure.store import store
from shared.helper import helper
from infrastructure.embeddings import embeddings
from shared.enum import ModelType, FileDataType


def update_backend_status(
    data_source_id: str,
    status: str,
    documents_count: int = 0,
    vectors_count: int = 0,
    error_message: str = None,
):
    """Update backend với trạng thái xử lý và metrics"""
    try:
        # TODO: Implement API call to update status and counts
        logger.info(f"DataSource {data_source_id}: {status}")
        logger.info(f"Documents: {documents_count}, Vectors: {vectors_count}")
        if error_message:
            logger.error(f"Error: {error_message}")
    except Exception as e:
        logger.error(f"Failed to update backend status: {e}")


def load_processed_csv_data(csv_path: str) -> list:
    """Load processed CSV data"""
    try:
        extracted_data = []

        with open(csv_path, "r", encoding="utf-8") as csvfile:
            reader = csv.reader(csvfile)
            headers = next(reader)  # Skip header row

            for row in reader:
                if row and row[0].strip():  # Check if text exists
                    extracted_data.append(row[0].strip())

        logger.info(f"Loaded {len(extracted_data)} text chunks from {csv_path}")
        return extracted_data

    except Exception as e:
        logger.error(f"Error loading CSV data: {e}")
        raise


def seed_data_from_csv(csv_path: str, data_source_id: str):
    """Seed data to vector store from processed CSV"""
    try:
        logger.info(f"🚀 Starting vector store upload for DataSource: {data_source_id}")
        logger.info(f"📄 Input file: {csv_path}")

        # Initialize store
        store.initStore()

        # Load processed data (already in text chunks)
        extracted_data = load_processed_csv_data(csv_path)

        if not extracted_data:
            raise Exception("No data found in CSV file")

        # Use existing helper for text chunking
        from langchain.schema import Document

        # Convert text strings to Document objects first
        documents = []
        for i, text in enumerate(extracted_data):
            doc = Document(
                page_content=text,
                metadata={
                    "source": os.path.basename(csv_path),
                    "data_source_id": data_source_id,
                    "original_chunk_index": i,
                },
            )
            documents.append(doc)

        logger.info(f"Created {len(documents)} initial documents")

        # Use helper to split text into optimal chunks
        text_chunks = helper.text_split(documents)

        # Update metadata for split chunks
        for i, chunk in enumerate(text_chunks):
            chunk.metadata.update(
                {
                    "chunk_index": i,
                }
            )

        logger.info(
            f"Created {len(text_chunks)} document chunks from {len(extracted_data)} original text(s)"
        )

        # Get embeddings model
        embeddings_model = embeddings.get_embeddings(ModelType.HUGGINGFACE)

        # Upload to Pinecone
        logger.info(f"📤 Uploading {len(text_chunks)} chunks to vector store...")
        store.uploadToStore(text_chunks, embeddings_model)

        documents_count = len(extracted_data)
        vectors_count = len(text_chunks)

        logger.success(f"✅ Successfully uploaded to vector store!")
        logger.info(f"📊 Documents processed: {documents_count}")
        logger.info(f"🔢 Vectors created: {vectors_count}")

        # Update backend with success metrics
        update_backend_status(
            data_source_id, "completed", documents_count, vectors_count
        )

        return documents_count, vectors_count

    except Exception as e:
        logger.error(f"Error during vector store upload: {e}")
        update_backend_status(data_source_id, "failed", 0, 0, str(e))
        raise


def seed_data(type: FileDataType = FileDataType.CSV):
    """Legacy seed function for backward compatibility"""
    store.initStore()

    # load files
    if type == FileDataType.CSV:
        extracted_data = helper.load_csv_files(path="../data/data_test/")
    elif type == FileDataType.PDF:
        extracted_data = helper.load_pdf_files(path="../data/pdf/")
    elif type == FileDataType.JSON:
        extracted_data = helper.load_json_files(path="../data/json/")
    else:
        raise Exception("Invalid file type")

    text_chunks = helper.text_split(extracted_data)

    # embeddings
    embeddings_model = embeddings.get_embeddings(ModelType.HUGGINGFACE)

    # upload to pinecone
    store.uploadToStore(text_chunks, embeddings_model)

    logger.info("Uploaded to pinecone")


def main():
    """Main seeding function"""
    if len(sys.argv) == 1:
        # Legacy mode - for backward compatibility
        logger.info("Running in legacy mode")
        seed_data(FileDataType.CSV)
        return

    if len(sys.argv) != 3:
        print("Usage: python seed.py <csv_file_path> <data_source_id>")
        print("   or: python seed.py (for legacy mode)")
        sys.exit(1)

    csv_path = sys.argv[1]
    data_source_id = sys.argv[2]

    logger.info(f"🌱 Starting vector store seeding")
    logger.info(f"📄 CSV file: {csv_path}")
    logger.info(f"📊 DataSource ID: {data_source_id}")

    try:
        # Check if file exists
        if not os.path.exists(csv_path):
            raise Exception(f"CSV file not found: {csv_path}")

        # Check if it's a CSV file
        if not csv_path.lower().endswith(".csv"):
            raise Exception(f"File must be a CSV file: {csv_path}")

        # Seed data to vector store
        documents_count, vectors_count = seed_data_from_csv(csv_path, data_source_id)

        # Output results for backend to capture
        print(
            f"SUCCESS: Uploaded {documents_count} documents and {vectors_count} vectors to Pinecone"
        )

    except Exception as e:
        error_msg = f"Vector store seeding failed: {str(e)}"
        logger.error(error_msg)
        print(f"ERROR: {error_msg}")
        sys.exit(1)


if __name__ == "__main__":
    main()

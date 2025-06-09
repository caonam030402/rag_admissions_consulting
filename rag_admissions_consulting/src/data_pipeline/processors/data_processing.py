#!/usr/bin/env python3
"""
Data Processing for RAG Admissions Consulting
Processes uploaded files (PDF/CSV) and prepares them for vector store
"""

import sys
import os
import json
import csv
import re
from pathlib import Path
from loguru import logger

# Add parent directory to path for imports
# Fix: Point to src directory instead of data_pipeline directory
current_dir = os.path.dirname(os.path.abspath(__file__))  # processors/
data_pipeline_dir = os.path.dirname(current_dir)  # data_pipeline/
src_dir = os.path.dirname(data_pipeline_dir)  # src/
sys.path.insert(0, src_dir)

from shared.helper import helper
from shared.enum import FileDataType


def update_backend_status(data_source_id: str, status: str, error_message: str = None):
    """Update backend với trạng thái xử lý"""
    try:
        # TODO: Implement API call to update status
        logger.info(f"DataSource {data_source_id}: {status}")
        if error_message:
            logger.error(f"Error: {error_message}")
    except Exception as e:
        logger.error(f"Failed to update backend status: {e}")


def process_pdf_file(file_path: str, data_source_id: str) -> str:
    """Process PDF file and convert to CSV format"""
    try:
        logger.info(f"📄 Processing PDF file: {file_path}")

        # Extract text from PDF using helper - single file processing
        documents = helper.load_pdf_file(file_path)

        if not documents:
            raise Exception("No text extracted from PDF file")

        # Create CSV output path
        output_path = f"data_pipeline/processed_data/pdf_{data_source_id}.csv"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save to CSV format
        with open(output_path, "w", encoding="utf-8", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["Text"])

            for doc in documents:
                # Extract text content from langchain document
                text_content = (
                    doc.page_content if hasattr(doc, "page_content") else str(doc)
                )

                if text_content and len(text_content.strip()) > 10:
                    # Split long text into chunks
                    text_chunks = helper.text_split([doc])

                    for chunk in text_chunks:
                        chunk_text = (
                            chunk.page_content
                            if hasattr(chunk, "page_content")
                            else str(chunk)
                        )
                        if chunk_text and len(chunk_text.strip()) > 10:
                            # Clean text
                            cleaned_text = re.sub(r"[\n\r\t]+", " ", chunk_text)
                            cleaned_text = re.sub(r"\s+", " ", cleaned_text.strip())
                            writer.writerow([cleaned_text])

        logger.success(f"✅ PDF processed successfully: {output_path}")
        return output_path

    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        raise


def process_csv_file(file_path: str, data_source_id: str) -> str:
    """Process CSV file and standardize format"""
    try:
        logger.info(f"📊 Processing CSV file: {file_path}")

        # Read and process CSV
        processed_data = []

        with open(file_path, "r", encoding="utf-8") as csvfile:
            # Try to detect if it has headers and delimiter
            sample = csvfile.read(1024)
            csvfile.seek(0)

            sniffer = csv.Sniffer()
            has_header = False
            delimiter = ","  # Default delimiter

            try:
                # Try to detect delimiter
                delimiter = sniffer.sniff(sample).delimiter
                has_header = sniffer.has_header(sample)
                logger.info(
                    f"Detected delimiter: '{delimiter}', has_header: {has_header}"
                )
            except csv.Error:
                # Fallback: try common delimiters
                logger.info("Could not auto-detect delimiter, trying common ones...")
                for test_delimiter in [",", ";", "\t", "|"]:
                    csvfile.seek(0)
                    test_reader = csv.reader(csvfile, delimiter=test_delimiter)
                    try:
                        first_row = next(test_reader)
                        if len(first_row) > 1:  # Found valid delimiter
                            delimiter = test_delimiter
                            logger.info(f"Using delimiter: '{delimiter}'")
                            break
                    except:
                        continue
                csvfile.seek(0)

            reader = csv.reader(csvfile, delimiter=delimiter)

            if has_header:
                headers = next(reader)  # Skip header row
                logger.info(f"CSV headers detected: {headers}")

            for row in reader:
                if row:  # Skip empty rows
                    # Combine all columns into single text
                    text = " ".join(str(cell).strip() for cell in row if cell.strip())
                    if text and len(text) > 10:
                        # Clean text
                        cleaned_text = re.sub(r"[\n\r\t]+", " ", text)
                        cleaned_text = re.sub(r"\s+", " ", cleaned_text.strip())
                        processed_data.append(cleaned_text)

        if not processed_data:
            raise Exception("No valid data found in CSV file")

        # Create standardized CSV output
        output_path = f"data_pipeline/processed_data/csv_{data_source_id}.csv"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        with open(output_path, "w", encoding="utf-8", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["Text"])

            for text in processed_data:
                writer.writerow([text])

        logger.success(f"✅ CSV processed successfully: {output_path}")
        return output_path

    except Exception as e:
        logger.error(f"Error processing CSV: {e}")
        raise


def detect_file_type(file_path: str) -> FileDataType:
    """Detect file type from extension"""
    file_extension = Path(file_path).suffix.lower()

    if file_extension == ".pdf":
        return FileDataType.PDF
    elif file_extension == ".csv":
        return FileDataType.CSV
    else:
        raise Exception(f"Unsupported file type: {file_extension}")


def main():
    """Main file processing function"""
    if len(sys.argv) != 3:
        print("Usage: python data_processing.py <file_path> <data_source_id>")
        sys.exit(1)

    file_path = sys.argv[1]
    data_source_id = sys.argv[2]

    logger.info(f"🔄 Starting file processing for: {file_path}")
    logger.info(f"📊 DataSource ID: {data_source_id}")

    try:
        # Check if file exists
        if not os.path.exists(file_path):
            raise Exception(f"File not found: {file_path}")

        # Update status to processing
        update_backend_status(data_source_id, "processing")

        # Detect file type
        file_type = detect_file_type(file_path)
        logger.info(f"📁 Detected file type: {file_type}")

        # Process based on file type
        if file_type == FileDataType.PDF:
            output_path = process_pdf_file(file_path, data_source_id)
        elif file_type == FileDataType.CSV:
            output_path = process_csv_file(file_path, data_source_id)
        else:
            raise Exception(f"Unsupported file type: {file_type}")

        # Read processed data for counting
        with open(output_path, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            next(reader)  # Skip header
            document_count = sum(1 for row in reader)

        logger.success(f"✅ File processing completed successfully!")
        logger.info(f"📄 Processed {document_count} text chunks")
        logger.info(f"💾 Output saved to: {output_path}")

        # Output results for backend to capture
        print(f"SUCCESS: Processed {document_count} documents, saved to {output_path}")

    except Exception as e:
        error_msg = f"File processing failed: {str(e)}"
        logger.error(error_msg)
        update_backend_status(data_source_id, "failed", error_msg)
        print(f"ERROR: {error_msg}")
        sys.exit(1)


if __name__ == "__main__":
    main()

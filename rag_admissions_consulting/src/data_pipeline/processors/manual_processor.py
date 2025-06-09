#!/usr/bin/env python3
"""
Manual Input Processor for RAG Admissions Consulting
Processes manual Q&A input and prepares it for vector store
"""

import sys
import os
import json
import csv
import re
import base64
import binascii
import tempfile
from loguru import logger

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def update_backend_status(data_source_id: str, status: str, error_message: str = None):
    """Update backend với trạng thái xử lý"""
    try:
        # TODO: Implement API call to update status
        logger.info(f"DataSource {data_source_id}: {status}")
        if error_message:
            logger.error(f"Error: {error_message}")
    except Exception as e:
        logger.error(f"Failed to update backend status: {e}")


def create_manual_input_file(input_data: dict, data_source_id: str) -> str:
    """Create temporary file with manual input data and return file path"""
    try:
        # Create temp file with JSON data
        temp_dir = "data_pipeline/temp"
        os.makedirs(temp_dir, exist_ok=True)

        temp_file_path = f"{temp_dir}/manual_input_{data_source_id}.json"

        with open(temp_file_path, "w", encoding="utf-8") as f:
            json.dump(input_data, f, ensure_ascii=False, indent=2)

        logger.info(f"📄 Created temporary input file: {temp_file_path}")
        return temp_file_path

    except Exception as e:
        logger.error(f"Error creating manual input file: {e}")
        raise


def process_manual_input(input_data: dict, data_source_id: str) -> str:
    """Process manual Q&A input and save to CSV format"""
    try:
        logger.info(f"📝 Processing manual input for DataSource: {data_source_id}")

        title = input_data.get("title", "").strip()
        content = input_data.get("content", "").strip()

        if not title or not content:
            raise Exception("Both title and content are required for manual input")

        # Create formatted text
        formatted_text = f"{title} {content}"

        # Clean text
        cleaned_text = re.sub(r"[\n\r\t]+", " ", formatted_text)
        cleaned_text = re.sub(r"\s+", " ", cleaned_text.strip())

        if len(cleaned_text) < 10:
            raise Exception("Input text is too short")

        # Create CSV output path
        output_path = f"data_pipeline/processed_data/manual_{data_source_id}.csv"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save to CSV format
        with open(output_path, "w", encoding="utf-8", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["Text"])
            writer.writerow([cleaned_text])

        logger.success(f"✅ Manual input processed successfully: {output_path}")
        return output_path

    except Exception as e:
        logger.error(f"Error processing manual input: {e}")
        raise


def process_manual_input_from_file(file_path: str, data_source_id: str) -> str:
    """Process manual input from JSON file"""
    try:
        logger.info(f"📝 Processing manual input from file: {file_path}")

        with open(file_path, "r", encoding="utf-8") as f:
            input_data = json.load(f)

        logger.info(f"📝 Loaded data: {input_data}")

        # Process the input
        output_path = process_manual_input(input_data, data_source_id)

        # Clean up temp file
        try:
            os.remove(file_path)
            logger.info(f"🗑️ Cleaned up temp file: {file_path}")
        except:
            pass  # Ignore cleanup errors

        return output_path

    except Exception as e:
        logger.error(f"Error processing manual input from file: {e}")
        raise


def main():
    """Main manual input processing function"""
    # Support multiple input methods:
    # 1. From file: python manual_processor.py --file <json_file> <data_source_id>
    # 2. From base64: python manual_processor.py <base64_encoded_json> <data_source_id>
    # 3. From JSON string: python manual_processor.py --json <json_string> <data_source_id>

    if len(sys.argv) < 3:
        print("Usage:")
        print("  python manual_processor.py --file <json_file> <data_source_id>")
        print("  python manual_processor.py --json <json_string> <data_source_id>")
        print("  python manual_processor.py <base64_encoded_json> <data_source_id>")
        sys.exit(1)

    try:
        if sys.argv[1] == "--file":
            # Process from file
            if len(sys.argv) != 4:
                print(
                    "Usage: python manual_processor.py --file <json_file> <data_source_id>"
                )
                sys.exit(1)

            json_file = sys.argv[2]
            data_source_id = sys.argv[3]

            logger.info(f"📝 Starting manual input processing from file")
            logger.info(f"📄 Input file: {json_file}")
            logger.info(f"📊 DataSource ID: {data_source_id}")

            # Update status to processing
            update_backend_status(data_source_id, "processing")

            # Process from file
            output_path = process_manual_input_from_file(json_file, data_source_id)

        elif sys.argv[1] == "--json":
            # Process from JSON string
            if len(sys.argv) != 4:
                print(
                    "Usage: python manual_processor.py --json <json_string> <data_source_id>"
                )
                sys.exit(1)

            json_string = sys.argv[2]
            data_source_id = sys.argv[3]

            logger.info(f"📝 Starting manual input processing from JSON string")
            logger.info(f"📊 DataSource ID: {data_source_id}")

            try:
                input_data = json.loads(json_string)
                logger.info(f"📝 Parsed JSON data: {input_data}")
            except json.JSONDecodeError as e:
                raise Exception(f"Invalid JSON string: {e}")

            # Update status to processing
            update_backend_status(data_source_id, "processing")

            # Process the input
            output_path = process_manual_input(input_data, data_source_id)

        else:
            # Legacy: Process from base64 (fallback for existing code)
            encoded_json = sys.argv[1]
            data_source_id = sys.argv[2]

            logger.info(f"📝 Starting manual input processing from base64")
            logger.info(f"📊 DataSource ID: {data_source_id}")
            logger.info(f"📄 Base64 encoded JSON length: {len(encoded_json)}")

            # Decode base64 and parse JSON
            try:
                decoded_json = base64.b64decode(encoded_json).decode("utf-8")
                logger.info(f"📝 Decoded JSON: {decoded_json}")
                input_data = json.loads(decoded_json)
                logger.info(f"📝 Parsed JSON data: {input_data}")
            except (
                base64.binascii.Error,
                json.JSONDecodeError,
                UnicodeDecodeError,
            ) as e:
                raise Exception(f"Invalid base64 encoded JSON: {e}")

            # Update status to processing
            update_backend_status(data_source_id, "processing")

            # Process the input
            output_path = process_manual_input(input_data, data_source_id)

        # Count processed documents (should be 1 for manual input)
        document_count = 1

        logger.success(f"✅ Manual input processing completed successfully!")
        logger.info(f"📄 Processed {document_count} Q&A entry")
        logger.info(f"💾 Output saved to: {output_path}")

        # Output results for backend to capture
        print(f"SUCCESS: Processed {document_count} document, saved to {output_path}")

    except Exception as e:
        error_msg = f"Manual input processing failed: {str(e)}"
        logger.error(error_msg)

        # Get data_source_id for error reporting
        data_source_id = sys.argv[-1] if len(sys.argv) >= 2 else "unknown"
        update_backend_status(data_source_id, "failed", error_msg)
        print(f"ERROR: {error_msg}")
        sys.exit(1)


if __name__ == "__main__":
    main()

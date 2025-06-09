#!/usr/bin/env python3
"""
Data Pipeline Runner for RAG Admissions Consulting
Runs the complete pipeline: processing -> vector store upload
Integrated with backend system
"""

import subprocess
import sys
import time
import os
import base64
from datetime import datetime
from pathlib import Path
from loguru import logger
import json
import tempfile

# Global variable to store the last success output for final reporting
last_success_output = ""


def run_command(command, description):
    """Run a command and log results"""
    logger.info(f"🚀 {description}")
    logger.info(f"📝 Command: {command}")

    try:
        # Fix: Use parent directory (src) as working directory instead of scripts
        script_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(script_dir)  # Go up one level to src/

        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            cwd=parent_dir,
        )

        if result.returncode == 0:
            logger.success(f"✅ {description} - COMPLETED")
            if result.stdout:
                logger.info(f"Output: {result.stdout.strip()}")

            # Store the last successful output for final reporting
            if result.stdout and "SUCCESS:" in result.stdout:
                global last_success_output
                last_success_output = result.stdout.strip()
        else:
            logger.error(f"❌ {description} - FAILED")
            logger.error(f"Error: {result.stderr}")
            return False

    except Exception as e:
        logger.error(f"❌ {description} - ERROR: {e}")
        return False

    return True


def run_individual_pipeline(data_source_id: str, data_type: str, input_path: str):
    """Run pipeline for a specific data source"""
    logger.info(f"🎯 Running pipeline for DataSource: {data_source_id}")
    logger.info(f"📊 Data type: {data_type}")
    logger.info(f"📄 Input: {input_path}")

    try:
        # Step 1: Process data based on type
        if data_type == "website":
            # For website crawling
            command = f'python data_pipeline/crawlers/scraper.py "{input_path}" "{data_source_id}"'
            description = f"Web Crawling - {input_path}"

            if not run_command(command, description):
                return False

            # CSV file should be created by scraper
            csv_file = f"data_pipeline/processed_data/scraped_{data_source_id}.csv"

        elif data_type in ["pdf", "csv"]:
            # For file uploads
            command = f'python data_pipeline/processors/data_processing.py "{input_path}" "{data_source_id}"'
            description = f"File Processing - {os.path.basename(input_path)}"

            if not run_command(command, description):
                return False

            # CSV file should be created by processor
            if data_type == "pdf":
                csv_file = f"data_pipeline/processed_data/pdf_{data_source_id}.csv"
            else:
                csv_file = f"data_pipeline/processed_data/csv_{data_source_id}.csv"

        elif data_type == "manual":
            # For manual input - create temporary file to avoid command line length limits
            logger.info(f"📝 Original input_path: {input_path}")
            logger.info(f"📝 Input type: {type(input_path)}")

            try:
                # Parse input data
                input_data = None

                # Check if input is base64 encoded (from NestJS)
                import re

                if (
                    re.match(r"^[A-Za-z0-9+/]*={0,2}$", input_path)
                    and len(input_path) > 20
                ):
                    try:
                        # Decode base64
                        decoded_json = base64.b64decode(input_path).decode("utf-8")
                        input_data = json.loads(decoded_json)
                        logger.info(f"📝 Decoded base64 input from NestJS")
                        logger.info(f"📝 Parsed data: {input_data}")
                    except (
                        base64.binascii.Error,
                        json.JSONDecodeError,
                        UnicodeDecodeError,
                    ):
                        # Not base64, treat as raw JSON
                        logger.info(f"📝 Not base64, treating as raw JSON")
                        input_data = None

                if input_data is None:
                    # Handle raw JSON input
                    if isinstance(input_path, str):
                        # If it looks like JSON but missing quotes, try to fix it
                        if input_path.startswith("{") and not input_path.startswith(
                            '{"'
                        ):
                            # Fix common command line quote stripping
                            fixed_json = re.sub(r"(\w+):", r'"\1":', input_path)
                            fixed_json = re.sub(r":(\w+)", r':"\1"', fixed_json)
                            logger.info(f"📝 Fixed JSON: {fixed_json}")
                            input_data = json.loads(fixed_json)
                        else:
                            input_data = json.loads(input_path)
                    else:
                        # Create JSON object
                        input_data = {"content": str(input_path)}

                # Create temporary file with input data
                temp_dir = "data_pipeline/temp"
                os.makedirs(temp_dir, exist_ok=True)
                temp_file_path = f"{temp_dir}/manual_input_{data_source_id}.json"

                with open(temp_file_path, "w", encoding="utf-8") as f:
                    json.dump(input_data, f, ensure_ascii=False, indent=2)

                logger.info(f"📄 Created temporary input file: {temp_file_path}")

                # Call processor with file method
                command = f'python data_pipeline/processors/manual_processor.py --file "{temp_file_path}" "{data_source_id}"'
                description = f"Manual Input Processing - DataSource {data_source_id}"

                if not run_command(command, description):
                    return False

            except Exception as e:
                logger.error(f"📝 Error processing manual input: {e}")
                return False

            # CSV file should be created by manual processor
            csv_file = f"data_pipeline/processed_data/manual_{data_source_id}.csv"

        else:
            logger.error(f"Unsupported data type: {data_type}")
            return False

        # Step 2: Upload to vector store
        command = f'python scripts/seed.py "{csv_file}" "{data_source_id}"'
        description = f"Vector Store Upload - {os.path.basename(csv_file)}"

        if not run_command(command, description):
            return False

        logger.success(
            f"🎊 Pipeline completed successfully for DataSource: {data_source_id}"
        )
        return True

    except Exception as e:
        logger.error(f"Pipeline failed for DataSource {data_source_id}: {e}")
        return False


def run_full_pipeline():
    """Run complete pipeline for all data sources (legacy mode)"""
    start_time = datetime.now()

    logger.info("🎯 RAG Admissions Consulting - Full Data Pipeline")
    logger.info(f"⏰ Started at: {start_time}")
    logger.info("=" * 60)

    # Pipeline steps for full pipeline
    steps = [
        {
            "command": "python data_pipeline/crawlers/scraper.py https://donga.edu.vn/tuyensinh example_id",
            "description": "Web Crawling - Sample university website",
        },
        {
            "command": "python scripts/seed.py",
            "description": "Vector Store Seeding - Legacy mode",
        },
    ]

    success_count = 0
    total_steps = len(steps)

    for i, step in enumerate(steps, 1):
        logger.info(f"\n📊 Step {i}/{total_steps}")

        if run_command(step["command"], step["description"]):
            success_count += 1
        else:
            logger.warning(f"⚠️ Step {i} failed, continuing with next step...")

        # Wait between steps
        if i < total_steps:
            time.sleep(2)

    # Summary
    end_time = datetime.now()
    duration = end_time - start_time

    logger.info("\n" + "=" * 60)
    logger.info("🎉 DATA PIPELINE SUMMARY")
    logger.info("=" * 60)
    logger.info(f"⏰ Started: {start_time}")
    logger.info(f"⏰ Finished: {end_time}")
    logger.info(f"⏱️ Duration: {duration}")
    logger.info(f"✅ Successful steps: {success_count}/{total_steps}")
    logger.info(f"❌ Failed steps: {total_steps - success_count}/{total_steps}")

    if success_count == total_steps:
        logger.success("🎊 ALL STEPS COMPLETED SUCCESSFULLY!")
        logger.info("📊 Data pipeline finished. RAG system is ready!")
    else:
        logger.warning("⚠️ Some steps failed. Check logs for details.")
        logger.info("💡 You can run individual steps manually if needed.")

    return success_count == total_steps


def main():
    """Main pipeline runner"""
    global last_success_output
    last_success_output = ""

    if len(sys.argv) == 1:
        # Full pipeline mode (legacy)
        logger.info("Running full pipeline (legacy mode)")
        success = run_full_pipeline()
        sys.exit(0 if success else 1)

    if len(sys.argv) != 4:
        print("Usage:")
        print("  python run_data_pipeline.py <data_source_id> <data_type> <input_path>")
        print("  python run_data_pipeline.py (for full pipeline)")
        print("")
        print("Data types: website, pdf, csv, manual")
        print("Examples:")
        print('  python run_data_pipeline.py ds123 website "https://example.com"')
        print('  python run_data_pipeline.py ds456 pdf "/path/to/file.pdf"')
        print(
            '  python run_data_pipeline.py ds789 manual \'{"title":"Q","content":"A"}\''
        )
        sys.exit(1)

    data_source_id = sys.argv[1]
    data_type = sys.argv[2]
    input_path = sys.argv[3]

    # Validate data type
    valid_types = ["website", "pdf", "csv", "manual"]
    if data_type not in valid_types:
        logger.error(f"Invalid data type: {data_type}. Must be one of: {valid_types}")
        sys.exit(1)

    # Run individual pipeline
    success = run_individual_pipeline(data_source_id, data_type, input_path)

    if success:
        # Output the last success message from seed.py if available
        if last_success_output and "SUCCESS:" in last_success_output:
            print(last_success_output)
        else:
            print(f"SUCCESS: Pipeline completed for DataSource {data_source_id}")
    else:
        print(f"ERROR: Pipeline failed for DataSource {data_source_id}")

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    # Configure logging
    logger.remove()
    logger.add(
        sys.stderr,
        level="INFO",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
    )

    # Ensure logs directory exists
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)

    logger.add(
        "logs/data_pipeline_{time:YYYY-MM-DD}.log",
        level="DEBUG",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
        rotation="1 day",
    )

    main()

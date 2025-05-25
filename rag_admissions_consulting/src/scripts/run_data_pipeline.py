#!/usr/bin/env python3
"""
Data Pipeline Runner
Chạy toàn bộ pipeline từ crawling đến processing
"""

import subprocess
import sys
import time
import os
from datetime import datetime
from loguru import logger


def run_command(command, description):
    """Chạy một command và log kết quả"""
    logger.info(f"🚀 {description}")
    logger.info(f"📝 Command: {command}")

    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            cwd=os.path.dirname(os.path.abspath(__file__)),
        )

        if result.returncode == 0:
            logger.success(f"✅ {description} - COMPLETED")
            if result.stdout:
                logger.info(f"Output: {result.stdout[:200]}...")
        else:
            logger.error(f"❌ {description} - FAILED")
            logger.error(f"Error: {result.stderr}")
            return False

    except Exception as e:
        logger.error(f"❌ {description} - ERROR: {e}")
        return False

    return True


def main():
    """Chạy toàn bộ data pipeline"""
    start_time = datetime.now()

    logger.info("🎯 RAG Admissions Consulting - Data Pipeline")
    logger.info(f"⏰ Started at: {start_time}")
    logger.info("=" * 60)

    # Pipeline steps
    steps = [
        {
            "command": "python data_pipeline/crawlers/scraper.py",
            "description": "Web Crawling - Thu thập dữ liệu từ website",
        },
        {
            "command": "python data_pipeline/processors/data_processing.py",
            "description": "Data Processing - Xử lý và làm sạch dữ liệu",
        },
        {
            "command": "python scripts/seed.py",
            "description": "Vector Store Seeding - Cập nhật vector database",
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

        # Đợi giữa các bước
        if i < total_steps:
            time.sleep(2)

    # Tổng kết
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


if __name__ == "__main__":
    # Configure logging
    logger.remove()
    logger.add(
        sys.stderr,
        level="INFO",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
    )
    logger.add(
        "logs/data_pipeline_{time:YYYY-MM-DD}.log",
        level="DEBUG",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
        rotation="1 day",
    )

    success = main()
    sys.exit(0 if success else 1)

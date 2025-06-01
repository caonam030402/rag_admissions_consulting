#!/usr/bin/env python3
"""
Test script cho backend config loading
"""

import asyncio
import os
import sys

# Add src to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import settings
from config.backend_config import BackendConfigLoader
from loguru import logger


async def test_backend_config():
    """Test việc lấy config từ backend"""

    logger.info("🧪 Testing backend config loading...")

    # Test 1: Kiểm tra BackendConfigLoader
    loader = BackendConfigLoader()
    logger.info(f"Backend URL: {loader.backend_url}")
    logger.info(f"Config endpoint: {loader.config_endpoint}")

    # Test 2: Fetch config
    config = await loader.fetch_config()

    if config:
        logger.success("✅ Successfully fetched config from backend!")
        logger.info(f"LLM Model: {config.llm_config.get('defaultModel')}")
        logger.info(f"Max Tokens: {config.llm_config.get('maxTokens')}")
        logger.info(f"Temperature: {config.llm_config.get('temperature')}")
        logger.info(f"Environment: {config.environment}")
        logger.info(f"Debug: {config.debug}")
        logger.info(f"Personality: {config.personality.get('name')}")
        logger.info(f"Contact Info: {config.contact_info.get('hotline')}")

        # Test 3: Apply config to settings
        logger.info("🔧 Applying config to settings...")
        success = await settings.load_config_from_backend()

        if success:
            logger.success("✅ Successfully applied backend config!")
            logger.info(f"Settings LLM Model: {settings.llm.default_model}")
            logger.info(f"Settings Environment: {settings.environment}")
            logger.info(f"Settings Assistant Name: {settings.get_assistant_name()}")
            logger.info(
                f"Settings Persona: {settings.get_persona_for_prompt()[:100]}..."
            )
            logger.info(
                f"Settings Contact Hotline: {settings.contact_info.get('hotline')}"
            )
        else:
            logger.error("❌ Failed to apply backend config")
    else:
        logger.error("❌ Failed to fetch config from backend")
        logger.info("Possible causes:")
        logger.info("- Backend is not running")
        logger.info("- Backend URL is incorrect")
        logger.info("- Network connection issues")


def test_sync_config():
    """Test sync version của config loading"""

    logger.info("🧪 Testing sync config loading...")

    # Test sync version
    success = settings.load_config_from_backend_sync()

    if success:
        logger.success("✅ Sync config loading successful!")
        logger.info(f"Settings LLM Model: {settings.llm.default_model}")
        logger.info(f"Settings Environment: {settings.environment}")
    else:
        logger.error("❌ Sync config loading failed")


def test_env_variables():
    """Test environment variables"""

    logger.info("🧪 Testing environment variables...")
    logger.info(f"USE_BACKEND_CONFIG: {os.getenv('USE_BACKEND_CONFIG', 'true')}")
    logger.info(f"BACKEND_URL: {os.getenv('BACKEND_URL', 'http://localhost:3001')}")
    logger.info(f"Settings use_backend_config: {settings.use_backend_config}")
    logger.info(f"Settings backend_url: {settings.backend_url}")


if __name__ == "__main__":
    # Setup logging
    logger.remove()
    logger.add(sys.stderr, level="INFO", format="{time} | {level} | {message}")

    # Test environment variables
    test_env_variables()

    # Test async version
    asyncio.run(test_backend_config())

    # Test sync version
    test_sync_config()

    logger.info("🎉 Test completed!")

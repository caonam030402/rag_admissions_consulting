"""
Test script để demo tích hợp API config cho RAG system
"""

import asyncio
import sys
import os
from loguru import logger
import httpx

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from config.settings import settings, initialize_settings_with_backend
from utils.config_client import config_client, load_backend_config
from core.prompt_engine import PromptEngine


async def test_config_integration():
    """Test config integration from backend"""

    logger.info("🧪 Testing RAG Config Integration")
    logger.info("=" * 50)

    # Test 1: Load config from backend
    logger.info("1️⃣ Testing backend config loading...")
    try:
        backend_config = await load_backend_config()
        logger.info(f"✅ Config loaded successfully: {list(backend_config.keys())}")
    except Exception as e:
        logger.error(f"❌ Failed to load config: {e}")
        return

    # Test 2: Initialize settings with backend config
    logger.info("\n2️⃣ Testing settings update...")
    try:
        await initialize_settings_with_backend()
        logger.info(
            f"✅ Settings updated. Backend config loaded: {settings.is_backend_config_loaded()}"
        )
    except Exception as e:
        logger.error(f"❌ Failed to update settings: {e}")
        return

    # Test 3: Display current personality configuration
    logger.info("\n3️⃣ Current Personality Configuration:")
    logger.info(f"📝 Name: {settings.personality.name}")
    logger.info(f"🎭 Personality: {settings.personality.personality}")
    logger.info(f"🧠 Creativity Level: {settings.personality.creativity_level}")
    logger.info(f"📄 Persona: {settings.personality.persona[:100]}...")

    # Test 4: Display contact info
    logger.info("\n4️⃣ Contact Information:")
    for key, value in settings.contact_info.items():
        logger.info(f"📞 {key.capitalize()}: {value}")

    # Test 5: Test prompt engine with new config
    logger.info("\n5️⃣ Testing Prompt Engine with new config...")
    try:
        prompt_engine = PromptEngine()
        simple_prompt = prompt_engine.create_simple_prompt("general")
        logger.info("✅ Prompt engine created successfully with dynamic config")

        # Show system prompt sample
        system_prompt = prompt_engine._get_base_system_prompt()
        logger.info(f"📋 System Prompt Sample: {system_prompt[:200]}...")

    except Exception as e:
        logger.error(f"❌ Failed to create prompt engine: {e}")
        return

    # Test 6: Environment and debug settings
    logger.info("\n6️⃣ Environment Settings:")
    logger.info(f"🌍 Environment: {settings.environment}")
    logger.info(f"🐛 Debug: {settings.debug}")
    logger.info(f"🔧 Development Mode: {settings.is_development()}")
    logger.info(f"🚀 Production Mode: {settings.is_production()}")

    logger.info("\n🎉 All tests completed successfully!")
    logger.info("✨ RAG system now uses dynamic config from backend")


async def test_fallback_behavior():
    """Test fallback behavior when backend is unavailable"""

    logger.info("\n🧪 Testing Fallback Behavior")
    logger.info("=" * 50)

    # Temporarily break the backend URL to test fallback
    original_url = config_client.backend_url
    config_client.backend_url = "http://invalid-url:9999"

    try:
        logger.info("1️⃣ Testing with invalid backend URL...")
        await initialize_settings_with_backend()

        logger.info("✅ Fallback successful - using default config")
        logger.info(f"📝 Default Name: {settings.personality.name}")
        logger.info(f"🎭 Default Personality: {settings.personality.personality}")

    except Exception as e:
        logger.error(f"❌ Fallback failed: {e}")
    finally:
        # Restore original URL
        config_client.backend_url = original_url


async def test_reload_endpoint():
    """Test the new reload-config endpoint"""

    logger.info("\n🧪 Testing Reload Config Endpoint")
    logger.info("=" * 50)

    rag_api_url = "http://localhost:8000/api/v1"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Test 1: Check config status endpoint
            logger.info("1️⃣ Testing config-status endpoint...")
            status_response = await client.get(f"{rag_api_url}/config-status")

            if status_response.status_code == 200:
                status_data = status_response.json()
                logger.info("✅ Config status retrieved successfully")
                logger.info(
                    f"📊 Config loaded from backend: {status_data.get('config_loaded_from_backend')}"
                )
                logger.info(
                    f"🎭 Current personality: {status_data.get('personality', {}).get('personality')}"
                )
                logger.info(
                    f"📝 Current name: {status_data.get('personality', {}).get('name')}"
                )
            else:
                logger.error(f"❌ Config status failed: {status_response.status_code}")
                return

            # Test 2: Reload config endpoint
            logger.info("\n2️⃣ Testing reload-config endpoint...")
            reload_response = await client.post(f"{rag_api_url}/reload-config")

            if reload_response.status_code == 200:
                reload_data = reload_response.json()
                logger.info("✅ Config reload successful")
                logger.info(f"🔄 Success: {reload_data.get('success')}")
                logger.info(f"📨 Message: {reload_data.get('message')}")
                logger.info(f"🏷️ Status: {reload_data.get('config_status')}")

                # Check for changes
                changes = reload_data.get("config_changes", {}).get("changes", {})
                personality_changed = changes.get("personality", {}).get(
                    "changed", False
                )
                name_changed = changes.get("name", {}).get("changed", False)

                if personality_changed or name_changed:
                    logger.info("🔄 Configuration changes detected:")
                    if personality_changed:
                        logger.info(
                            f"  🎭 Personality: {changes['personality']['previous']} → {changes['personality']['current']}"
                        )
                    if name_changed:
                        logger.info(
                            f"  📝 Name: {changes['name']['previous']} → {changes['name']['current']}"
                        )
                else:
                    logger.info("📋 No configuration changes detected")

            else:
                logger.error(f"❌ Config reload failed: {reload_response.status_code}")
                error_detail = reload_response.json()
                logger.error(f"Error details: {error_detail}")

            # Test 3: Verify config status after reload
            logger.info("\n3️⃣ Verifying config after reload...")
            verify_response = await client.get(f"{rag_api_url}/config-status")

            if verify_response.status_code == 200:
                verify_data = verify_response.json()
                logger.info("✅ Post-reload verification successful")
                logger.info(
                    f"📊 Config loaded from backend: {verify_data.get('config_loaded_from_backend')}"
                )
                logger.info(
                    f"🎭 Current personality: {verify_data.get('personality', {}).get('personality')}"
                )
                logger.info(
                    f"📝 Current name: {verify_data.get('personality', {}).get('name')}"
                )
            else:
                logger.error(
                    f"❌ Post-reload verification failed: {verify_response.status_code}"
                )

    except httpx.ConnectError:
        logger.error(
            "❌ Cannot connect to RAG API. Make sure the RAG server is running on http://localhost:8000"
        )
    except Exception as e:
        logger.error(f"❌ Error testing reload endpoint: {e}")


async def test_runtime_config_changes():
    """Test runtime configuration changes simulation"""

    logger.info("\n🧪 Testing Runtime Config Changes")
    logger.info("=" * 50)

    logger.info("1️⃣ Current config state:")
    logger.info(f"📝 Name: {settings.personality.name}")
    logger.info(f"🎭 Personality: {settings.personality.personality}")
    logger.info(f"🧠 Creativity: {settings.personality.creativity_level}")

    # Simulate prompt generation with current config
    logger.info("\n2️⃣ Testing prompt generation with current config:")
    try:
        prompt_engine = PromptEngine()
        current_prompt = prompt_engine._get_base_system_prompt()
        logger.info(f"📋 Current prompt style: {current_prompt[:150]}...")

        # Test with different personality styles
        for personality_type in ["Professional", "Friendly", "Empathetic"]:
            # Temporarily change personality for demonstration
            original_personality = settings.personality.personality
            settings.personality.personality = personality_type

            test_prompt = prompt_engine._get_base_system_prompt()
            logger.info(f"🎭 {personality_type} style: {test_prompt[:100]}...")

            # Restore original
            settings.personality.personality = original_personality

    except Exception as e:
        logger.error(f"❌ Error testing prompt variations: {e}")


if __name__ == "__main__":
    # Configure logging for demo
    logger.remove()
    logger.add(
        sys.stderr,
        level="INFO",
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{message}</cyan>",
    )

    # Run tests
    asyncio.run(test_config_integration())
    asyncio.run(test_fallback_behavior())
    asyncio.run(test_reload_endpoint())
    asyncio.run(test_runtime_config_changes())

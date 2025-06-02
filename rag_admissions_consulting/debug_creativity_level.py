"""
Debug script để kiểm tra creativity level mapping từ backend
"""

import asyncio
import sys
import os
from loguru import logger
import httpx
import json

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from config.settings import settings, initialize_settings_with_backend
from utils.config_client import config_client, load_backend_config


async def debug_creativity_level():
    """Debug creativity level từ backend đến RAG system"""

    logger.info("🐛 Debugging Creativity Level Mapping")
    logger.info("=" * 60)

    # Step 1: Kiểm tra giá trị hiện tại trong RAG
    logger.info("1️⃣ Current RAG Settings:")
    logger.info(f"   📊 Creativity Level: {settings.personality.creativity_level}")
    logger.info(f"   🧠 Name: {settings.personality.name}")
    logger.info(f"   🎭 Personality: {settings.personality.personality}")
    logger.info(f"   📡 Backend config loaded: {settings.is_backend_config_loaded()}")

    # Step 2: Call backend API trực tiếp để xem response
    logger.info("\n2️⃣ Direct Backend API Call:")
    backend_url = os.getenv("BACKEND_URL", "http://localhost:3000")
    api_endpoint = f"{backend_url}/api/v1/chatbot-config/rag/config"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            logger.info(f"   🔗 Calling: {api_endpoint}")
            response = await client.get(api_endpoint)

            if response.status_code == 200:
                backend_data = response.json()
                logger.info("   ✅ Backend response received")

                # In ra raw response
                logger.info("   📄 Raw Response:")
                logger.info(f"   {json.dumps(backend_data, indent=2)}")

                # Kiểm tra personality section
                if "personality" in backend_data:
                    personality = backend_data["personality"]
                    logger.info(f"\n   🎭 Personality from backend:")
                    logger.info(f"      📝 Name: {personality.get('name', 'N/A')}")
                    logger.info(
                        f"      🎭 Personality: {personality.get('personality', 'N/A')}"
                    )
                    logger.info(
                        f"      🧠 CreativityLevel: {personality.get('creativityLevel', 'N/A')}"
                    )
                    logger.info(
                        f"      📄 Persona: {personality.get('persona', 'N/A')[:50]}..."
                    )
                else:
                    logger.error("   ❌ No personality section in response!")

            else:
                logger.error(f"   ❌ Backend API failed: {response.status_code}")
                logger.error(f"   Response: {response.text}")

    except Exception as e:
        logger.error(f"   ❌ Error calling backend: {e}")

    # Step 3: Test config client
    logger.info("\n3️⃣ Config Client Test:")
    try:
        config_data = await load_backend_config()
        logger.info("   ✅ Config client loaded data")

        if "personality" in config_data:
            personality = config_data["personality"]
            logger.info(
                f"   🧠 Creativity from config client: {personality.get('creativityLevel', 'N/A')}"
            )
        else:
            logger.error("   ❌ No personality in config client data")

    except Exception as e:
        logger.error(f"   ❌ Config client failed: {e}")

    # Step 4: Test settings update
    logger.info("\n4️⃣ Settings Update Test:")
    try:
        old_creativity = settings.personality.creativity_level
        logger.info(f"   📊 Before update: {old_creativity}")

        await initialize_settings_with_backend()

        new_creativity = settings.personality.creativity_level
        logger.info(f"   📊 After update: {new_creativity}")
        logger.info(f"   🔄 Changed: {old_creativity != new_creativity}")

        if old_creativity == new_creativity:
            logger.warning("   ⚠️ No change detected - possible mapping issue!")

    except Exception as e:
        logger.error(f"   ❌ Settings update failed: {e}")

    # Step 5: Manual mapping test
    logger.info("\n5️⃣ Manual Mapping Test:")
    try:
        # Get backend data again
        config_data = await load_backend_config()

        if "personality" in config_data:
            backend_creativity = config_data["personality"].get("creativityLevel")
            logger.info(
                f"   🔍 Backend creativityLevel value: {backend_creativity} (type: {type(backend_creativity)})"
            )

            # Manual mapping
            if backend_creativity is not None:
                settings.personality.creativity_level = float(backend_creativity)
                logger.info(
                    f"   ✅ Manual mapping successful: {settings.personality.creativity_level}"
                )
            else:
                logger.error("   ❌ Backend creativityLevel is None")

    except Exception as e:
        logger.error(f"   ❌ Manual mapping failed: {e}")

    # Step 6: Final verification
    logger.info("\n6️⃣ Final State:")
    logger.info(
        f"   📊 Current creativity level: {settings.personality.creativity_level}"
    )
    logger.info(f"   🎭 Current personality: {settings.personality.personality}")
    logger.info(f"   📝 Current name: {settings.personality.name}")


async def test_rag_api_endpoints():
    """Test RAG API endpoints để kiểm tra giá trị creativity"""

    logger.info("\n🔍 Testing RAG API Endpoints")
    logger.info("=" * 60)

    rag_api_url = "http://localhost:8000/api/v1"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Test config-status endpoint
            logger.info("1️⃣ Testing config-status endpoint:")
            response = await client.get(f"{rag_api_url}/config-status")

            if response.status_code == 200:
                data = response.json()
                logger.info("   ✅ Config status retrieved")

                personality = data.get("personality", {})
                creativity = personality.get("creativity_level", "N/A")
                logger.info(f"   🧠 Creativity level from API: {creativity}")
                logger.info(
                    f"   🎭 Personality: {personality.get('personality', 'N/A')}"
                )
                logger.info(f"   📝 Name: {personality.get('name', 'N/A')}")

            else:
                logger.error(f"   ❌ Config status failed: {response.status_code}")

            # Test reload-config endpoint
            logger.info("\n2️⃣ Testing reload-config endpoint:")
            response = await client.post(f"{rag_api_url}/reload-config")

            if response.status_code == 200:
                data = response.json()
                logger.info("   ✅ Config reload successful")

                current_config = data.get("current_config", {})
                personality = current_config.get("personality", {})
                creativity = personality.get("creativity_level", "N/A")
                logger.info(f"   🧠 Creativity after reload: {creativity}")

                # Check changes
                changes = data.get("config_changes", {}).get("changes", {})
                if "creativity_level" in changes:
                    logger.info(
                        f"   🔄 Creativity changed: {changes['creativity_level']}"
                    )

            else:
                logger.error(f"   ❌ Config reload failed: {response.status_code}")

    except Exception as e:
        logger.error(f"   ❌ Error testing RAG APIs: {e}")


if __name__ == "__main__":
    # Configure logging
    logger.remove()
    logger.add(
        sys.stderr,
        level="INFO",
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{message}</cyan>",
    )

    # Run debug
    asyncio.run(debug_creativity_level())
    asyncio.run(test_rag_api_endpoints())

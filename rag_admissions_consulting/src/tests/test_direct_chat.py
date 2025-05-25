import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.chat_service import ChatService
from core.context_cache import context_cache


async def test_direct_chat():
    """Test ChatService trực tiếp"""
    print("🧪 Testing ChatService directly...")

    # Test 1: Tạo ChatService
    chat_service = ChatService(
        user_id=1, user_email="test@example.com", conversation_id="test-direct-123"
    )

    print(
        f"✅ ChatService created with conversation_id: {chat_service.conversation_id}"
    )
    print(f"📊 Context cache stats: {context_cache.get_cache_stats()}")

    # Test 2: Gửi tin nhắn đầu tiên
    print("\n🧪 Sending first message...")
    response_tokens = []
    async for token_data in chat_service.process_message_stream("ngành điều dưỡng"):
        if "delta" in token_data:
            response_tokens.append(token_data["delta"])

    print(f"✅ First response: {len(response_tokens)} tokens")
    print(f"📊 Context cache stats: {context_cache.get_cache_stats()}")

    # Test 3: Gửi tin nhắn thứ hai
    print("\n🧪 Sending second message...")
    response_tokens2 = []
    async for token_data in chat_service.process_message_stream("học phí sao?"):
        if "delta" in token_data:
            response_tokens2.append(token_data["delta"])

    print(f"✅ Second response: {len(response_tokens2)} tokens")
    print(f"📊 Context cache stats: {context_cache.get_cache_stats()}")

    # Test 4: Kiểm tra context messages
    context_messages = await chat_service.context_manager.get_context_messages()
    print(f"\n📝 Context messages: {len(context_messages)}")
    for i, msg in enumerate(context_messages):
        print(f"  {i+1}. {msg['role']}: {msg['content'][:50]}...")


if __name__ == "__main__":
    asyncio.run(test_direct_chat())

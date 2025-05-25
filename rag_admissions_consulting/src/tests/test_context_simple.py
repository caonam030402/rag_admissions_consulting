import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import json


def test_context_simple():
    """Test context đơn giản"""

    print("🧪 Test 1: Hỏi về ngành điều dưỡng...")

    # Câu hỏi 1
    response1 = requests.post(
        "http://localhost:8000/api/v1/chat",
        json={"message": "ngành điều dưỡng", "user_email": "test@example.com"},
        stream=True,
    )

    conversation_id = None
    print("Response 1:")
    for line in response1.iter_lines():
        if line:
            try:
                data = json.loads(line.decode("utf-8"))
                if "conversation_id" in data:
                    conversation_id = data["conversation_id"]
                if "delta" in data:
                    print(data["delta"], end="")
            except:
                pass

    print(f"\n\nConversation ID: {conversation_id}")

    print("\n" + "=" * 50)
    print("🧪 Test 2: Hỏi về học phí (cùng user)...")

    # Câu hỏi 2 - cùng user
    response2 = requests.post(
        "http://localhost:8000/api/v1/chat",
        json={"message": "học phí sao?", "user_email": "test@example.com"},
        stream=True,
    )

    print("Response 2:")
    for line in response2.iter_lines():
        if line:
            try:
                data = json.loads(line.decode("utf-8"))
                if "delta" in data:
                    print(data["delta"], end="")
            except:
                pass

    print("\n\n" + "=" * 50)

    # Kiểm tra status
    print("🧪 Kiểm tra status...")
    status_response = requests.get("http://localhost:8000/status")
    if status_response.status_code == 200:
        status = status_response.json()
        print(f"Sessions: {status.get('session_manager', {}).get('total_sessions', 0)}")
        print(f"Contexts: {status.get('context_cache', {}).get('total_contexts', 0)}")

        # In chi tiết context cache
        context_cache = status.get("context_cache", {})
        if context_cache.get("conversations"):
            print("\nContext details:")
            for conv_id, details in context_cache["conversations"].items():
                print(f"  {conv_id}: {details['total_messages']} messages")


if __name__ == "__main__":
    test_context_simple()

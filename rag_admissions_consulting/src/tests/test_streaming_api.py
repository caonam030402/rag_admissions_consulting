import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import json
import time


def test_streaming_api():
    """Test streaming API để xem context có hoạt động không"""
    base_url = "http://localhost:8000/api/v1"

    # Test 1: Gửi tin nhắn đầu tiên
    print("🧪 Test 1: Gửi tin nhắn đầu tiên...")
    response1 = requests.post(
        f"{base_url}/chat",
        json={"message": "ngành điều dưỡng", "user_email": "test@example.com"},
        headers={"Content-Type": "application/json"},
        stream=True,
    )

    print(f"Status: {response1.status_code}")
    if response1.status_code == 200:
        full_response1 = ""
        conversation_id1 = None

        for line in response1.iter_lines():
            if line:
                try:
                    data = json.loads(line.decode("utf-8"))
                    if "delta" in data:
                        full_response1 += data["delta"]
                    if "conversation_id" in data:
                        conversation_id1 = data["conversation_id"]
                except json.JSONDecodeError:
                    continue

        print(f"Response 1: {full_response1[:100]}...")
        print(f"Conversation ID: {conversation_id1}")
    else:
        print(f"Error: {response1.text}")
        return

    # Đợi một chút
    time.sleep(1)

    # Test 2: Gửi tin nhắn thứ hai với cùng user (không cần conversation_id vì SessionManager tự quản lý)
    print("\n🧪 Test 2: Gửi tin nhắn thứ hai...")
    response2 = requests.post(
        f"{base_url}/chat",
        json={
            "message": "học phí sao?",
            "user_email": "test@example.com",  # Cùng user_email, SessionManager sẽ tự tìm conversation
        },
        headers={"Content-Type": "application/json"},
        stream=True,
    )

    print(f"Status: {response2.status_code}")
    if response2.status_code == 200:
        full_response2 = ""
        conversation_id2 = None

        for line in response2.iter_lines():
            if line:
                try:
                    data = json.loads(line.decode("utf-8"))
                    if "delta" in data:
                        full_response2 += data["delta"]
                    if "conversation_id" in data:
                        conversation_id2 = data["conversation_id"]
                except json.JSONDecodeError:
                    continue

        print(f"Response 2: {full_response2[:100]}...")
        print(f"Conversation ID: {conversation_id2}")

        # Kiểm tra xem có cùng conversation_id không
        if conversation_id1 == conversation_id2:
            print("✅ Cùng conversation_id - Context được duy trì!")
        else:
            print("❌ Khác conversation_id - Context bị mất!")
    else:
        print(f"Error: {response2.text}")

    # Test 3: Kiểm tra status
    print("\n🧪 Test 3: Kiểm tra status...")
    status_response = requests.get(f"{base_url.replace('/api/v1', '')}/status")
    if status_response.status_code == 200:
        status_data = status_response.json()
        print(f"Sessions: {len(status_data.get('session_manager', {}))}")
        context_cache = status_data.get("context_cache", {})
        print(f"Context cache total: {context_cache.get('total_contexts', 0)}")

        # In chi tiết conversations
        conversations = context_cache.get("conversations", {})
        for conv_id, stats in conversations.items():
            print(f"  Conversation {conv_id}: {stats['total_messages']} messages")
    else:
        print(f"Status error: {status_response.text}")


if __name__ == "__main__":
    test_streaming_api()

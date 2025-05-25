import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import json
import time


def test_api_endpoint():
    """Test API endpoint để xem context có hoạt động không"""
    base_url = "http://localhost:8000/api/v1"

    # Test 1: Gửi tin nhắn đầu tiên
    print("🧪 Test 1: Gửi tin nhắn đầu tiên...")
    response1 = requests.post(
        f"{base_url}/chat",
        json={"message": "ngành điều dưỡng", "user_email": "test@example.com"},
        headers={"Content-Type": "application/json"},
    )

    print(f"Status: {response1.status_code}")
    if response1.status_code == 200:
        data1 = response1.json()
        print(f"Response: {data1.get('response', '')[:100]}...")
        print(f"Conversation ID: {data1.get('conversation_id', 'N/A')}")
        conversation_id = data1.get("conversation_id")
    else:
        print(f"Error: {response1.text}")
        return

    # Đợi một chút
    time.sleep(1)

    # Test 2: Gửi tin nhắn thứ hai với cùng user
    print("\n🧪 Test 2: Gửi tin nhắn thứ hai...")
    response2 = requests.post(
        f"{base_url}/chat",
        json={
            "message": "học phí sao?",
            "user_email": "test@example.com",
            "conversation_id": conversation_id,  # Sử dụng conversation_id từ lần đầu
        },
        headers={"Content-Type": "application/json"},
    )

    print(f"Status: {response2.status_code}")
    if response2.status_code == 200:
        data2 = response2.json()
        print(f"Response: {data2.get('response', '')[:100]}...")
        print(f"Conversation ID: {data2.get('conversation_id', 'N/A')}")
    else:
        print(f"Error: {response2.text}")

    # Test 3: Kiểm tra status
    print("\n🧪 Test 3: Kiểm tra status...")
    status_response = requests.get(f"{base_url.replace('/api/v1', '')}/status")
    if status_response.status_code == 200:
        status_data = status_response.json()
        print(f"Sessions: {len(status_data.get('session_manager', {}))}")
        print(f"Context cache: {status_data.get('context_cache', {})}")
    else:
        print(f"Status error: {status_response.text}")


if __name__ == "__main__":
    test_api_endpoint()

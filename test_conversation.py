import requests
import json
import uuid

# Test data
API_BASE_URL = "http://localhost:5000/api/v1"
CHAT_API_URL = f"{API_BASE_URL}/chatbots/history"


def test_conversation_creation():
    """Test creating a conversation via backend API"""

    # Test guest user conversation creation
    test_data = {
        "guestId": "guest-1734567890-abc123",
        "role": "user",
        "content": "Hello, this is a test message",
        "conversationId": str(uuid.uuid4()),
        "title": "Test Conversation",
    }

    print("🔧 TEST: Testing conversation creation...")
    print(f"🔧 TEST: Request data: {json.dumps(test_data, indent=2)}")

    try:
        response = requests.post(CHAT_API_URL, json=test_data, timeout=10)

        print(f"🔧 TEST: Response status: {response.status_code}")
        print(f"🔧 TEST: Response headers: {dict(response.headers)}")

        if response.status_code == 200 or response.status_code == 201:
            result = response.json()
            print(f"🔧 TEST: Success! Response: {json.dumps(result, indent=2)}")
        else:
            print(f"🔧 TEST: Error! Status: {response.status_code}")
            print(f"🔧 TEST: Error response: {response.text}")

    except Exception as e:
        print(f"🔧 TEST: Exception: {str(e)}")


def test_get_conversations():
    """Test getting conversations for guest user"""

    guest_id = "guest-1734567890-abc123"
    params = {"guestId": guest_id, "page": 1, "limit": 50}

    print("\n🔧 TEST: Testing get conversations...")
    print(f"🔧 TEST: Params: {params}")

    try:
        response = requests.get(
            f"{API_BASE_URL}/chatbots/conversations", params=params, timeout=10
        )

        print(f"🔧 TEST: Response status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(
                f"🔧 TEST: Success! Found {len(result.get('data', []))} conversations"
            )
            print(f"🔧 TEST: Conversations: {json.dumps(result, indent=2)}")
        else:
            print(f"🔧 TEST: Error! Status: {response.status_code}")
            print(f"🔧 TEST: Error response: {response.text}")

    except Exception as e:
        print(f"🔧 TEST: Exception: {str(e)}")


if __name__ == "__main__":
    print("🔧 Starting conversation creation test...")

    # Test 1: Create a conversation
    test_conversation_creation()

    # Test 2: Get conversations to verify it was created
    test_get_conversations()

    print("\n🔧 Test completed!")

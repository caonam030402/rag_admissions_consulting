import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import requests
import json
from loguru import logger


# Test context management
async def test_context():
    """Test xem context có được lưu và truy xuất đúng không"""

    # Test 1: Gửi tin nhắn đầu tiên
    print("🧪 Test 1: Gửi câu hỏi đầu tiên về ngành điều dưỡng...")

    response1 = requests.post(
        "http://localhost:8000/api/v1/chat",
        json={"message": "ngành điều dưỡng", "user_email": "test@example.com"},
        stream=True,
    )

    conversation_id = None
    print("📝 Response 1:")
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
    print("\n")

    if conversation_id:
        print(f"✅ Conversation ID: {conversation_id}")
    else:
        print("❌ Không lấy được conversation ID")
        return

    # Đợi một chút
    await asyncio.sleep(2)

    # Test 2: Gửi câu hỏi follow-up
    print("\n🧪 Test 2: Gửi câu hỏi follow-up về học phí...")

    response2 = requests.post(
        "http://localhost:8000/api/v1/chat",
        json={"message": "học phí như nào?", "user_email": "test@example.com"},
        stream=True,
    )

    print("📝 Response 2:")
    for line in response2.iter_lines():
        if line:
            try:
                data = json.loads(line.decode("utf-8"))
                if "delta" in data:
                    print(data["delta"], end="")
            except:
                pass
    print("\n")


def test_backend_api():
    """Test xem backend API có hoạt động không"""
    print("🧪 Test Backend API...")

    try:
        # Test POST message
        response = requests.post(
            "http://localhost:5000/api/v1/chatbots/history",
            json={
                "email": "test@example.com",
                "role": "user",
                "content": "Test message",
                "conversationId": "test-123",
            },
            timeout=5,
        )

        if response.status_code < 300:
            print("✅ Backend API hoạt động bình thường")
            print(f"Response: {response.json()}")
        else:
            print(f"⚠️ Backend API trả về lỗi: {response.status_code}")
            print(f"Response: {response.text}")

    except requests.exceptions.ConnectionError:
        print("❌ Không thể kết nối đến Backend API")
        print("💡 Backend API có thể chưa chạy hoặc URL không đúng")
    except Exception as e:
        print(f"❌ Lỗi khi test Backend API: {e}")


def test_app_status():
    """Test trạng thái ứng dụng"""
    print("🧪 Test Application Status...")

    try:
        response = requests.get("http://localhost:8000/status", timeout=5)
        if response.status_code == 200:
            status = response.json()
            print("✅ Application đang chạy")
            print(f"📊 Status: {json.dumps(status, indent=2)}")

            app_manager = status.get("application_manager", {})
            if app_manager.get("initialized"):
                print("✅ ApplicationManager đã được khởi tạo")
            else:
                print("❌ ApplicationManager chưa được khởi tạo")
                print(f"Components: {app_manager.get('components', [])}")
        else:
            print(f"❌ Application trả về lỗi: {response.status_code}")

    except Exception as e:
        print(f"❌ Không thể kết nối đến Application: {e}")


if __name__ == "__main__":
    print("🚀 Bắt đầu test context management...\n")

    # Test 1: Application status
    test_app_status()
    print("\n" + "=" * 50 + "\n")

    # Test 2: Backend API
    test_backend_api()
    print("\n" + "=" * 50 + "\n")

    # Test 3: Context flow
    asyncio.run(test_context())

    print("\n�� Test hoàn thành!")

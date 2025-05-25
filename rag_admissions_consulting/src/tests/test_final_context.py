import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import json
import time


def test_final_context():
    """Test cuối cùng để xác nhận context hoạt động hoàn hảo"""
    base_url = "http://localhost:8000/api/v1"

    print("🎯 TEST CUỐI CÙNG: Context Memory của Chatbot")
    print("=" * 60)

    # Test 1: Hỏi về ngành cụ thể
    print("👤 User: Tôi muốn biết về ngành Kỹ thuật phần mềm")
    response1 = requests.post(
        f"{base_url}/chat",
        json={
            "message": "Tôi muốn biết về ngành Kỹ thuật phần mềm",
            "user_email": "student@example.com",
        },
        headers={"Content-Type": "application/json"},
        stream=True,
    )

    full_response1 = ""
    conversation_id = None

    for line in response1.iter_lines():
        if line:
            try:
                data = json.loads(line.decode("utf-8"))
                if "delta" in data:
                    full_response1 += data["delta"]
                if "conversation_id" in data:
                    conversation_id = data["conversation_id"]
            except json.JSONDecodeError:
                continue

    print(f"🤖 Bot: {full_response1[:200]}...")
    print(f"📝 Conversation ID: {conversation_id}")

    time.sleep(1)

    # Test 2: Hỏi follow-up về học phí (không nhắc lại ngành)
    print("\n👤 User: Học phí bao nhiêu?")
    response2 = requests.post(
        f"{base_url}/chat",
        json={"message": "Học phí bao nhiêu?", "user_email": "student@example.com"},
        headers={"Content-Type": "application/json"},
        stream=True,
    )

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

    print(f"🤖 Bot: {full_response2[:200]}...")

    time.sleep(1)

    # Test 3: Hỏi follow-up về cơ hội việc làm
    print("\n👤 User: Cơ hội việc làm thế nào?")
    response3 = requests.post(
        f"{base_url}/chat",
        json={
            "message": "Cơ hội việc làm thế nào?",
            "user_email": "student@example.com",
        },
        headers={"Content-Type": "application/json"},
        stream=True,
    )

    full_response3 = ""
    conversation_id3 = None

    for line in response3.iter_lines():
        if line:
            try:
                data = json.loads(line.decode("utf-8"))
                if "delta" in data:
                    full_response3 += data["delta"]
                if "conversation_id" in data:
                    conversation_id3 = data["conversation_id"]
            except json.JSONDecodeError:
                continue

    print(f"🤖 Bot: {full_response3[:200]}...")

    # Kiểm tra kết quả
    print("\n" + "=" * 60)
    print("📊 KẾT QUẢ KIỂM TRA:")

    if conversation_id == conversation_id2 == conversation_id3:
        print("✅ CONVERSATION ID: Nhất quán qua 3 câu hỏi")
    else:
        print("❌ CONVERSATION ID: Không nhất quán")
        print(f"   ID1: {conversation_id}")
        print(f"   ID2: {conversation_id2}")
        print(f"   ID3: {conversation_id3}")

    # Kiểm tra xem bot có nhớ ngữ cảnh không
    context_keywords = ["kỹ thuật phần mềm", "phần mềm", "IT", "lập trình"]
    has_context = any(
        keyword.lower() in full_response2.lower()
        or keyword.lower() in full_response3.lower()
        for keyword in context_keywords
    )

    if has_context:
        print("✅ CONTEXT MEMORY: Bot nhớ ngữ cảnh về ngành Kỹ thuật phần mềm")
    else:
        print("❌ CONTEXT MEMORY: Bot không nhớ ngữ cảnh")

    # Kiểm tra status cuối
    status_response = requests.get(f"{base_url.replace('/api/v1', '')}/status")
    if status_response.status_code == 200:
        status_data = status_response.json()
        context_cache = status_data.get("context_cache", {})
        conversations = context_cache.get("conversations", {})

        if conversation_id in conversations:
            stats = conversations[conversation_id]
            print(f"✅ CACHE STATUS: {stats['total_messages']} tin nhắn được lưu")
        else:
            print("❌ CACHE STATUS: Không tìm thấy conversation trong cache")

    print("\n🎉 TEST HOÀN THÀNH!")


if __name__ == "__main__":
    test_final_context()

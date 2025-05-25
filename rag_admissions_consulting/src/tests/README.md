# Test Suite - RAG Admissions Consulting

Folder này chứa các file test để kiểm tra tính năng của chatbot.

## 📋 Danh sách Tests

### 🎯 **Recommended Tests** (Chạy theo thứ tự này)

1. **`test_direct_chat.py`** - Test cơ bản nhất
   - Test ChatService trực tiếp (không qua API)
   - Kiểm tra context memory hoạt động
   - **Chạy**: `python tests/test_direct_chat.py`

2. **`test_streaming_api.py`** - Test API streaming
   - Test qua HTTP API với streaming response
   - Kiểm tra SessionManager và context persistence
   - **Chạy**: `python tests/test_streaming_api.py`

3. **`test_final_context.py`** - Test context memory hoàn chỉnh
   - Test 3 câu hỏi liên tiếp để kiểm tra ngữ cảnh
   - Đánh giá khả năng nhớ context của bot
   - **Chạy**: `python tests/test_final_context.py`

### 🔧 **Component Tests**

4. **`test_cache.py`** - Test ContextCache riêng biệt
   - Test caching mechanism
   - **Chạy**: `python tests/test_cache.py`

5. **`test_context.py`** - Test ContextManager chi tiết
   - Test context management với nhiều scenarios
   - **Chạy**: `python tests/test_context.py`

### 📊 **Legacy Tests**

6. **`test_context_simple.py`** - Test đơn giản qua API
   - Version đơn giản của context test
   - **Chạy**: `python tests/test_context_simple.py`

7. **`test_api_endpoint.py`** - Test API endpoint (deprecated)
   - Test cũ cho non-streaming API
   - **Note**: Có thể không hoạt động vì API hiện tại là streaming

## 🚀 Quick Start

```bash
# Chạy test cơ bản nhất
python tests/test_direct_chat.py

# Chạy test API streaming (cần server chạy)
python tests/test_streaming_api.py

# Chạy test context memory hoàn chỉnh
python tests/test_final_context.py
```

## 📝 Test Results Expected

### ✅ Successful Test Indicators:
- **Context Cache**: `total_contexts > 0`
- **Conversation ID**: Nhất quán qua các request
- **Context Memory**: Bot nhớ ngữ cảnh từ câu hỏi trước
- **Message Count**: Tăng dần qua các lượt chat

### ❌ Common Issues:
- **Backend API Error**: Disable backend integration (đã fix)
- **Port 8000 in use**: Thay đổi port hoặc kill process
- **Context not found**: Kiểm tra SessionManager và ContextCache

## 🔍 Debug Tips

1. **Kiểm tra logs**: Tất cả tests có debug output chi tiết
2. **Status endpoint**: `/status` để xem application state
3. **Clear cache**: Restart application để clear cache
4. **Conversation ID**: Phải nhất quán qua các request của cùng user

## 🏗️ Architecture Tested

```
Tests Coverage:
├── API Layer (routes.py) ✅
├── Services Layer (chat_service.py) ✅  
├── Core Layer
│   ├── ContextManager ✅
│   ├── ContextCache ✅
│   ├── SessionManager ✅
│   ├── RAG Engine ✅
│   └── Query Analyzer ✅
└── Integration Tests ✅
``` 
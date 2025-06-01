# Backend Config Loading

Hệ thống RAG hỗ trợ load config từ backend NestJS để đồng bộ cấu hình.

## 🔧 Cách hoạt động

1. **Khi khởi động app**: RAG system sẽ gọi API `GET /v1/chatbot-config/rag/config` để lấy config
2. **Merge config**: Chỉ update những field có giá trị từ backend, còn lại giữ nguyên config local
3. **Fallback**: Nếu backend không available, sẽ sử dụng config local

## 📡 API Endpoint

```
GET http://localhost:5000/api/v1/chatbot-config/rag/config
```

**Response format:**
```json
{
  "llmConfig": {
    "defaultModel": "GEMINI",
    "maxTokens": 2048,
    "temperature": 0.7
  },
  "chatConfig": {
    "maxContextLength": 20,
    "contextWindowMinutes": 30,
    "maxResponseTokens": 1024,
    "streamDelayMs": 50
  },
  "personality": {
    "name": "Assistant",
    "persona": "Bạn là một chuyên viên tư vấn...",
    "personality": "Professional",
    "creativityLevel": 0.2
  },
  "contactInfo": {
    "hotline": "0236.3.650.403",
    "email": "tuyensinh@donga.edu.vn",
    "website": "https://donga.edu.vn",
    "address": "33 Xô Viết Nghệ Tĩnh, Hải Châu, Đà Nẵng"
  },
  "environment": "development",
  "debug": false
}
```

## ⚙️ Environment Variables

```bash
# Có load config từ backend không
USE_BACKEND_CONFIG=true

# URL của backend server (bao gồm /api/v1)
BACKEND_URL=http://localhost:5000/api/v1
```

## 🚀 Cách sử dụng

### 1. Async Loading (trong startup)
```python
from config.settings import settings

# Load config khi khởi động app
success = await settings.load_config_from_backend()
if success:
    print("✅ Config loaded from backend")
else:
    print("⚠️ Using local config")
```

### 2. Sync Loading
```python
from config.settings import settings

# Load config sync
success = settings.load_config_from_backend_sync()
```

### 3. Access config
```python
from config.settings import settings

# LLM config
model = settings.llm.default_model
max_tokens = settings.llm.max_tokens
temperature = settings.llm.temperature

# Chat config
context_length = settings.chat.max_context_length

# Personality
assistant_name = settings.get_assistant_name()
persona = settings.get_persona_for_prompt()

# Contact info
hotline = settings.contact_info["hotline"]
email = settings.contact_info["email"]
```

## 🧪 Testing

```bash
# Test config loading
cd src/config
python test_config.py
```

**Expected output:**
```
🧪 Testing environment variables...
🧪 Testing backend config loading...
✅ Successfully fetched config from backend!
✅ Successfully applied backend config!
🎉 Test completed!
```

## 🔄 Config Priority

1. **Backend config** (highest priority)
2. **Local environment variables**
3. **Default values** (lowest priority)

## 🛡️ Error Handling

- Timeout: 10 giây
- HTTP errors: Log và fallback về local config
- Network errors: Log và fallback về local config
- Parse errors: Log và fallback về local config

## 📝 Notes

- Config từ backend chỉ update những field có giá trị
- Personality và contact info được merge từ backend
- API keys không được lấy từ backend (bảo mật)
- Debug mode và environment được sync từ backend 
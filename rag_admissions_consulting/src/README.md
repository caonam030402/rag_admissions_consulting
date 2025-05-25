# RAG Admissions Consulting - Intelligent Chatbot

## 🎯 Tổng quan

Hệ thống chatbot tư vấn tuyển sinh thông minh sử dụng công nghệ RAG (Retrieval-Augmented Generation) để cung cấp thông tin chính xác và có ngữ cảnh về tuyển sinh Đại học Đông Á.

## 🏗️ Kiến trúc mới (v2.0)

### Cấu trúc thư mục
```
src/
├── api/                    # API endpoints và routes
│   ├── __init__.py
│   └── routes.py          # FastAPI routes
├── core/                   # Core business logic
│   ├── __init__.py
│   ├── context_manager.py  # Quản lý ngữ cảnh hội thoại
│   ├── prompt_engine.py    # Tạo prompt thông minh
│   ├── query_analyzer.py   # Phân tích ý định câu hỏi
│   └── rag_engine.py      # RAG engine chính
├── services/              # Business services
│   ├── __init__.py
│   ├── chat_service.py    # Service xử lý chat
│   └── user_service.py    # Service quản lý user
├── infrastructure/        # Infrastructure components
│   ├── embeddings.py      # Embedding models
│   ├── llms.py           # Language models
│   └── store.py          # Vector store
├── data_pipeline/         # Data crawling và processing
│   ├── crawlers/          # Web crawlers
│   ├── processors/        # Data processors
│   ├── raw_data/          # Dữ liệu thô
│   └── processed_data/    # Dữ liệu đã xử lý
├── scripts/               # Utility scripts
│   ├── seed.py           # Database seeding
│   └── run_data_pipeline.py  # Data pipeline runner
├── config/                # Configuration
│   ├── __init__.py
│   └── settings.py        # Cấu hình tập trung
├── shared/                # Shared utilities
│   ├── database.py        # Database connection
│   ├── enum.py           # Enums
│   └── helper.py         # Helper functions
├── tests/                 # Test suite
├── legacy/                # Legacy files (deprecated)
├── logs/                  # Application logs
└── main.py               # FastAPI application
```

## 🚀 Tính năng mới

### 1. **Context-Aware Conversations**
- Hiểu ngữ cảnh cuộc trò chuyện
- Trả lời dựa trên lịch sử chat
- Xử lý câu hỏi follow-up thông minh

### 2. **Intelligent Query Analysis**
- Phân tích ý định câu hỏi
- Phân loại loại câu hỏi (tuyển sinh, học phí, ngành học, v.v.)
- Xác định độ phức tạp và yêu cầu ngữ cảnh

### 3. **Enhanced RAG Engine**
- Retrieval thông minh dựa trên loại câu hỏi
- Prompt engineering động
- Cải thiện chất lượng phản hồi

### 4. **Clean Architecture**
- Tách biệt rõ ràng các layer
- Dễ maintain và extend
- Testable và scalable

## 🛠️ Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 2. Cấu hình environment variables
Copy file mẫu và chỉnh sửa:
```bash
cp env_example.txt .env
```

Chỉnh sửa file `.env` với các thông tin cần thiết:
```bash
# Required - API Keys
GEMINI_API_KEY=your_gemini_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment

# Backend API for Chat History (nếu có)
API_BASE_URL=http://localhost:5000/api/v1

# Optional - có giá trị mặc định
DB_HOST=localhost
DB_PORT=5432
API_PORT=8000
LOG_LEVEL=INFO
```

### 3. Chạy ứng dụng
```bash
# Development
python main.py

# Production
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Chạy data pipeline (tùy chọn)
```bash
# Chạy toàn bộ pipeline crawling và processing
python scripts/run_data_pipeline.py

# Hoặc chạy từng bước riêng biệt
python data_pipeline/crawlers/scraper.py
python data_pipeline/processors/data_processing.py
python scripts/seed.py
```

### 5. Kiểm tra trạng thái
- **Health check**: `GET http://localhost:8000/health`
- **Detailed status**: `GET http://localhost:8000/status`
- **API docs**: `http://localhost:8000/docs`

## 🔄 Tích hợp Backend API

Hệ thống hỗ trợ tích hợp với backend API để lưu trữ lịch sử chat:

### Backend API Endpoints
```bash
# Lưu tin nhắn
POST {API_BASE_URL}/chatbots/history
{
    "email": "user@example.com",
    "role": "user",
    "content": "Câu hỏi của user",
    "conversationId": "uuid"
}

# Lấy lịch sử
GET {API_BASE_URL}/chatbots/history?conversationId=uuid&limit=10
```

### Fallback Strategy
- Nếu backend API không khả dụng, hệ thống sẽ sử dụng cache local
- Đảm bảo chatbot vẫn hoạt động ngay cả khi backend offline
- Tự động retry khi backend khôi phục

## 📡 API Endpoints

### Chat Endpoint
```
POST /api/v1/chat
Content-Type: application/json

{
    "message": "Tôi muốn hỏi về ngành Công nghệ thông tin",
    "user_email": "user@example.com"
}
```

Response: Server-Sent Events stream
```
data: {"delta": "Chào", "conversation_id": "uuid"}
data: {"delta": " bạn!", "conversation_id": "uuid"}
```

### Health Check
```
GET /health
```

## 🧠 Intelligent Features

### Query Analysis
Hệ thống phân tích câu hỏi theo các loại:
- `specific_program`: Câu hỏi về ngành học cụ thể
- `admission_process`: Quy trình tuyển sinh
- `fees_scholarships`: Học phí và học bổng
- `facilities_campus`: Cơ sở vật chất
- `career_prospects`: Triển vọng nghề nghiệp
- `general_info`: Thông tin chung

### Context Management
- Lưu trữ lịch sử hội thoại trong memory
- Tự động cleanup tin nhắn cũ
- Context window thông minh (30 phút)
- Hỗ trợ follow-up questions

### Prompt Engineering
- Dynamic prompt generation
- Context-aware prompts
- Specialized prompts cho từng loại câu hỏi
- Conversation history integration

## 🔧 Configuration

Tất cả cấu hình được quản lý tập trung trong `config/settings.py`:

```python
from config.settings import settings

# Database config
db_host = settings.database.host

# LLM config  
model_type = settings.llm.default_model

# Chat config
max_context = settings.chat.max_context_length
```

## 🧪 Testing

The application includes comprehensive tests in the `tests/` folder:

```bash
# Chạy test cơ bản nhất
python tests/test_direct_chat.py

# Chạy test API streaming (cần server chạy trước)
python tests/test_streaming_api.py

# Chạy test context memory hoàn chỉnh
python tests/test_final_context.py

# Hoặc chạy tất cả tests tự động
python tests/run_tests.py
```

📁 **Test Structure:**
- `tests/test_direct_chat.py` - Test ChatService trực tiếp
- `tests/test_streaming_api.py` - Test API streaming
- `tests/test_final_context.py` - Test context memory hoàn chỉnh
- `tests/test_cache.py` - Test ContextCache
- `tests/run_tests.py` - Script chạy tất cả tests
- `tests/README.md` - Chi tiết về từng test

## 📈 Performance Optimizations

1. **Lazy Loading**: Components khởi tạo khi cần
2. **Connection Pooling**: Database connection pool
3. **Caching**: User cache và response cache
4. **Streaming**: Real-time response streaming
5. **Memory Management**: Tự động cleanup context cũ

## 🔒 Security

- Input validation với Pydantic
- Environment-based configuration
- Database connection security
- CORS configuration

## 📝 Logging

Sử dụng Loguru với cấu hình linh hoạt:
- Structured logging
- Multiple log levels
- File rotation
- Performance monitoring

## 🚀 Deployment

### Docker (Recommended)
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production
```bash
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING
DB_POOL_SIZE=20
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow clean architecture principles
4. Add tests for new features
5. Submit pull request

## 📞 Support

- **Hotline**: 0236.3.650.403
- **Email**: tuyensinh@donga.edu.vn
- **Website**: https://donga.edu.vn 
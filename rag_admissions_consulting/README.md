# RAG Admissions Consulting API

Intelligent admissions consulting chatbot with RAG (Retrieval-Augmented Generation) capabilities.

## 🚀 Quick Start

### Development Mode (with Auto-reload)

Similar to NestJS development mode, the server will automatically restart when you save changes to your code.

#### Option 1: Using Development Scripts

**Windows:**

```bash
# Run the batch file
dev.bat
```

**Linux/Mac:**

```bash
# Make script executable and run
chmod +x dev.sh
./dev.sh
```

**Cross-platform:**

```bash
# Run Python script directly
python dev.py
```

#### Option 2: Using uvicorn directly

```bash
# From the project root
uvicorn src.main:app --reload --reload-dir src/ --host 0.0.0.0 --port 8000
```

#### Option 3: Using the main.py file

```bash
# From src directory
cd src
python main.py
```

### Production Mode

```bash
# From src directory (no auto-reload)
cd src
ENVIRONMENT=production python main.py
```

## 📁 Project Structure

```
rag_admissions_consulting/
├── src/                    # Source code
│   ├── main.py            # FastAPI application entry point
│   ├── api/               # API routes
│   ├── core/              # Core business logic
│   ├── shared/            # Shared utilities
│   └── ...
├── dev.py                 # Development server script
├── dev.bat               # Windows development script
├── dev.sh                # Linux/Mac development script
└── README.md             # This file
```

## 🔧 Features

- **Auto-reload**: Automatically restarts server when code changes (development mode)
- **CORS enabled**: Ready for frontend integration
- **Health checks**: `/health` and `/status` endpoints
- **API documentation**: Available at `/docs` (Swagger UI)
- **Session management**: User session handling
- **RAG capabilities**: Intelligent document retrieval and generation

## 🌐 API Endpoints

- **Health Check**: `GET /` or `GET /health`
- **Detailed Status**: `GET /status`
- **API Documentation**: `GET /docs`
- **Clear Session**: `POST /api/v1/clear-session`

## 🛠️ Development

When running in development mode, the server will:

- Watch for file changes in the `src/` directory
- Automatically reload when `.py` files are modified
- Show detailed logs and access logs
- Enable CORS for frontend development

The auto-reload feature works similar to NestJS's development mode, making development faster and more efficient.

## 📝 Environment Variables

- `ENVIRONMENT`: Set to `production` to disable auto-reload (default: `development`)

## 🔍 Monitoring

Use the `/status` endpoint to monitor:

- Application manager status
- Session manager state
- Context cache statistics
- Component initialization status

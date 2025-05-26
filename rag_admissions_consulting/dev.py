#!/usr/bin/env python3
"""
Development server script with auto-reload
Similar to NestJS development mode
"""

import uvicorn
import os
import sys

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

if __name__ == "__main__":
    print("🚀 Starting RAG Admissions Consulting API in DEVELOPMENT mode")
    print("📁 Watching for file changes...")
    print("🔄 Auto-reload enabled")
    print("🌐 Server will be available at: http://localhost:8000")
    print("📖 API docs at: http://localhost:8000/docs")
    print("⚡ Press Ctrl+C to stop\n")
    
    uvicorn.run(
        "src.main:app",  # Path to the FastAPI app
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload
        reload_dirs=["src/"],  # Watch src directory for changes
        reload_includes=["*.py"],  # Only watch Python files
        log_level="info",
        access_log=True
    ) 
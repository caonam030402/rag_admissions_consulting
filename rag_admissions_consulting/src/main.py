from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys
import os

# Add the src directory to Python path for absolute imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.routes import router
from shared.database import setup_database
from core.app_manager import app_manager

# Configure logging
logger.remove()
logger.add(sys.stderr, level="INFO", format="{time} | {level} | {message}")

app = FastAPI(
    title="RAG Admissions Consulting API",
    description="Intelligent admissions consulting chatbot with RAG capabilities",
    version="2.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    try:
        logger.info("🚀 Starting RAG Admissions Consulting API...")

        # Setup database connection
        setup_database()
        logger.info("✅ Database setup completed")

        # Initialize all application components for faster response times
        logger.info("🔧 Initializing all application components...")
        await app_manager.initialize_all_components()

        logger.info("🎉 Application startup completed successfully!")
        logger.info(f"📊 Application status: {app_manager.get_status()}")

    except Exception as e:
        logger.error(f"❌ Error during startup: {e}")
        logger.warning(
            "⚠️ Continuing with partial initialization - some features may be slower on first use"
        )
        # Continue running - services will handle initialization on demand


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("Shutting down RAG Admissions Consulting API...")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "RAG Admissions Consulting API",
        "version": "2.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    app_status = app_manager.get_status()
    return {
        "status": "healthy" if app_status["initialized"] else "partial",
        "version": "2.0.0",
        "components": {
            "api": "running",
            "database": "connected",
            "rag_engine": "ready" if app_status["initialized"] else "initializing",
        },
        "application_manager": app_status,
    }


@app.get("/status")
async def detailed_status():
    """Get detailed application status"""
    from core.session_manager import session_manager
    from core.context_cache import context_cache

    return {
        "application_manager": app_manager.get_status(),
        "session_manager": session_manager.get_all_sessions(),
        "context_cache": context_cache.get_cache_stats(),
        "version": "2.0.0",
        "environment": "development",
    }


@app.post("/api/v1/clear-session")
async def clear_user_session(user_email: str):
    """Clear session for a specific user"""
    from core.session_manager import session_manager

    session_manager.clear_session(user_email)
    return {"message": f"Session cleared for user: {user_email}"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

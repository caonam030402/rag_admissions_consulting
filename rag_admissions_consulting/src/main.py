from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, AsyncGenerator
from datetime import datetime
from rag_agent import RagAgent
from llms import LLms
from shared.enum import ModelType, RoleType
from store import store
from embeddings import embeddings
from shared.database import DatabaseConnection, setup_database
from shared.chat_history_db import ChatHistoryManager
from loguru import logger
import json
import asyncio

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup database on startup
@app.on_event("startup")
async def startup_event():
    setup_database()

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str
    conversation_id: str

class ChatRequest(BaseModel):
    message: str
    user_email: str

class ChatResponse(BaseModel):
    message: str
    conversation_id: str

def get_or_create_user(user_email: str) -> int:
    """Get user ID from email or create new user"""
    try:
        conn = DatabaseConnection.get_connection()
        cur = conn.cursor()
        
        # Check if user exists
        cur.execute("SELECT id FROM users WHERE email = %s", (user_email,))
        result = cur.fetchone()
        
        if result:
            return result[0]
        
        # Create new user
        cur.execute("INSERT INTO users (email) VALUES (%s) RETURNING id", (user_email,))
        user_id = cur.fetchone()[0]
        conn.commit()
        return user_id
        
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            DatabaseConnection.return_connection(conn)

async def stream_chat_response(request: ChatRequest) -> AsyncGenerator[str, None]:
    # Get or create user
    user_id = get_or_create_user(request.user_email)
    
    # Initialize chat history manager
    chat_manager = ChatHistoryManager(user_id)
    
    # Initialize RAG components
    llm = LLms.getLLm(ModelType.GEMINI)
    embedding = embeddings.get_embeddings(ModelType.HUGGINGFACE)
    retriever = store.getRetriever(embedding)
    
    # Get conversation context
    context = chat_manager.get_conversation_context()
    
    # Save user message asynchronously
    import asyncio
    asyncio.create_task(save_message(chat_manager, RoleType.USER, request.message))
    
    full_response = ""
    async for token in RagAgent.answer_question_stream(
        question=request.message,
        llm=llm,
        retriever=retriever,
        chat_history=[(msg['role'], msg['content']) for msg in context]
    ):
        full_response += token
        yield json.dumps({"delta": token, "conversation_id": chat_manager.conversation_id}) + "\n"
    
    # Save assistant's complete message asynchronously
    asyncio.create_task(save_message(chat_manager, RoleType.ASSISTANT, full_response))

async def save_message(chat_manager: ChatHistoryManager, role: RoleType, content: str):
    """Asynchronously save message to database"""
    try:
        await asyncio.to_thread(chat_manager.append_message, role, content)
    except Exception as e:
        logger.error(f"Error saving message to database: {e}")

@app.post("/chat")
async def send_chat(request: ChatRequest):
    try:
        return StreamingResponse(
            stream_chat_response(request),
            media_type="text/event-stream"
        )

    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/{user_email}", response_model=List[ChatMessage])
async def get_chat_history(user_email: str):
    try:
        user_id = get_or_create_user(user_email)
        chat_manager = ChatHistoryManager(user_id)
        return [ChatMessage(**msg) for msg in chat_manager.messages]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
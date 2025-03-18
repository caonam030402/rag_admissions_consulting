import json
import os
from pathlib import Path
from datetime import datetime
import uuid

class ChatHistoryManager:
    def __init__(self):
        self.history_dir = Path('data/chat_history')
        self.history_file = self.history_dir / 'chat_history.json'
        self.current_conversation_id = str(uuid.uuid4())
        self._ensure_history_dir()
    
    def _ensure_history_dir(self):
        """Ensure the chat history directory exists"""
        self.history_dir.mkdir(parents=True, exist_ok=True)
        if not self.history_file.exists():
            self._save_messages([])
    
    def load_messages(self):
        """Load chat messages from the JSON file"""
        try:
            with open(self.history_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading chat history: {e}")
            return []
    
    def _save_messages(self, messages):
        """Save chat messages to the JSON file"""
        try:
            with open(self.history_file, 'w', encoding='utf-8') as f:
                json.dump(messages, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving chat history: {e}")
    
    def append_message(self, role, content):
        """Append a new message to the chat history with timestamp and conversation ID"""
        messages = self.load_messages()
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "conversation_id": self.current_conversation_id
        }
        messages.append(message)
        self._save_messages(messages)

    def get_conversation_context(self, limit=10):
        """Get recent messages from the current conversation for context"""
        messages = self.load_messages()
        conversation_messages = [msg for msg in messages 
                               if msg.get("conversation_id") == self.current_conversation_id]
        return conversation_messages[-limit:] if conversation_messages else []
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import json
from loguru import logger


@dataclass
class Message:
    role: str
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Message':
        data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        return cls(**data)


class ConversationMemory:
    def __init__(self, max_messages: int = 10, user_id: Optional[str] = None):
        self.max_messages = max_messages
        self.messages: List[Message] = []
        self.user_id = user_id
        self.user_preferences: Dict[str, Any] = {}
        self.context_variables: Dict[str, Any] = {}
        
    def add_message(self, role: str, content: str, metadata: Dict[str, Any] = None) -> None:
        """Add a new message to the conversation history."""
        message = Message(role=role, content=content, metadata=metadata or {})
        self.messages.append(message)
        
        # Trim history if it exceeds max_messages
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
            
        logger.debug(f"Added message: {role}: {content[:50]}...")
    
    def get_recent_messages(self, n: Optional[int] = None) -> List[Message]:
        """Get the n most recent messages."""
        if n is None:
            return self.messages
        return self.messages[-n:]
    
    def get_formatted_history(self) -> List[Dict[str, str]]:
        """Get history formatted for LLM context."""
        return [{"role": msg.role, "content": msg.content} for msg in self.messages]
    
    def update_user_preferences(self, preferences: Dict[str, Any]) -> None:
        """Update user preferences for personalization."""
        self.user_preferences.update(preferences)
        logger.info(f"Updated user preferences for user {self.user_id}")
    
    def add_context_variable(self, key: str, value: Any) -> None:
        """Add or update a context variable."""
        self.context_variables[key] = value
        logger.debug(f"Added context variable {key}")
    
    def get_context_summary(self) -> str:
        """Get a summary of current context and preferences."""
        summary = {
            "user_id": self.user_id,
            "preferences": self.user_preferences,
            "context_variables": self.context_variables,
            "message_count": len(self.messages)
        }
        return json.dumps(summary, indent=2)
    
    def clear_history(self) -> None:
        """Clear conversation history while preserving user preferences and context."""
        self.messages = []
        logger.info(f"Cleared conversation history for user {self.user_id}")
    
    def save_to_file(self, filepath: str) -> None:
        """Save conversation state to a file."""
        data = {
            "user_id": self.user_id,
            "preferences": self.user_preferences,
            "context_variables": self.context_variables,
            "messages": [msg.to_dict() for msg in self.messages]
        }
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved conversation state to {filepath}")
    
    @classmethod
    def load_from_file(cls, filepath: str) -> 'ConversationMemory':
        """Load conversation state from a file."""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        memory = cls(user_id=data.get('user_id'))
        memory.user_preferences = data.get('preferences', {})
        memory.context_variables = data.get('context_variables', {})
        memory.messages = [Message.from_dict(msg) for msg in data.get('messages', [])]
        
        logger.info(f"Loaded conversation state from {filepath}")
        return memory 
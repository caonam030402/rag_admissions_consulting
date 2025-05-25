import os
import time
import psycopg2
import psycopg2.pool
from loguru import logger


# Create a connection pool
connection_pool = None
# Flag to track if we're using in-memory mode
using_memory_mode = False


class DatabaseConnection:
    _cache = {}
    # In-memory storage for when database is unavailable
    _memory_users = {}
    _memory_conversations = {}
    _memory_messages = {}
    _next_id = {"users": 1, "conversations": 1, "messages": 1}

    @staticmethod
    def initialize_pool(min_connections=2, max_connections=10):
        """Initialize the connection pool"""
        global connection_pool, using_memory_mode
        if connection_pool is None:
            try:
                connection_pool = psycopg2.pool.ThreadedConnectionPool(
                    minconn=min_connections,
                    maxconn=max_connections,
                    user="postgres",
                    password="postgres",
                    host="localhost",
                    port="5432",
                    database="rag_admission",
                )
                logger.info("Connection pool created successfully")
            except Exception as e:
                logger.error(f"Error creating connection pool: {e}")
                logger.warning("Falling back to in-memory storage for faster operation")
                using_memory_mode = True

    @classmethod
    def get_cache(cls, key):
        return cls._cache.get(key)

    @classmethod
    def set_cache(cls, key, value, ttl=300):  # 5 minutes TTL by default
        cls._cache[key] = {"value": value, "expires_at": time.time() + ttl}

    @classmethod
    def clear_expired_cache(cls):
        current_time = time.time()
        expired_keys = [
            k for k, v in cls._cache.items() if current_time > v["expires_at"]
        ]
        for k in expired_keys:
            del cls._cache[k]

    @staticmethod
    def get_connection():
        """Get a connection from the pool or None if in memory mode"""
        global connection_pool, using_memory_mode
        if using_memory_mode:
            return None
        if connection_pool is None:
            DatabaseConnection.initialize_pool()
            if using_memory_mode:
                return None
        return connection_pool.getconn()

    @staticmethod
    def return_connection(conn):
        """Return a connection to the pool"""
        global connection_pool, using_memory_mode
        if not using_memory_mode and connection_pool is not None and conn is not None:
            connection_pool.putconn(conn)

    @classmethod
    def close_all_connections(cls):
        global connection_pool, using_memory_mode
        if not using_memory_mode and connection_pool is not None:
            connection_pool.closeall()
            logger.info("All database connections closed")

    @classmethod
    def memory_get_or_create_user(cls, email):
        """In-memory version of user operations"""
        # Check if user exists by email
        for user_id, user_data in cls._memory_users.items():
            if user_data["email"] == email:
                return user_id

        # Create new user
        user_id = cls._next_id["users"]
        cls._next_id["users"] += 1
        cls._memory_users[user_id] = {"email": email, "created_at": time.time()}
        return user_id

    @classmethod
    def memory_create_conversation(cls, user_id):
        """Create a new conversation in memory"""
        conv_id = cls._next_id["conversations"]
        cls._next_id["conversations"] += 1
        cls._memory_conversations[conv_id] = {
            "user_id": user_id,
            "created_at": time.time(),
            "updated_at": time.time(),
        }
        return conv_id

    @classmethod
    def memory_add_message(cls, conversation_id, role, content):
        """Add a message to memory storage"""
        msg_id = cls._next_id["messages"]
        cls._next_id["messages"] += 1
        cls._memory_messages[msg_id] = {
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "created_at": time.time(),
        }
        # Update conversation time
        if conversation_id in cls._memory_conversations:
            cls._memory_conversations[conversation_id]["updated_at"] = time.time()
        return msg_id

    @classmethod
    def memory_get_conversation_messages(cls, conversation_id, limit=10):
        """Get messages for a conversation from memory"""
        messages = [
            {"id": msg_id, **msg_data}
            for msg_id, msg_data in cls._memory_messages.items()
            if msg_data["conversation_id"] == conversation_id
        ]
        # Sort by created_at
        messages.sort(key=lambda x: x["created_at"])
        return messages[-limit:] if len(messages) > limit else messages


def setup_database():
    """Set up the database tables if they don't exist"""
    # Initialize the connection pool
    DatabaseConnection.initialize_pool()

    global using_memory_mode
    if using_memory_mode:
        logger.info("Using in-memory storage mode")
        return

    conn = None
    try:
        conn = DatabaseConnection.get_connection()
        if conn is None:  # Double-check in case mode changed
            logger.info("Using in-memory storage mode")
            return

        cur = conn.cursor()

        # Create users table
        cur.execute(
            """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        )

        # Create conversations table
        cur.execute(
            """
        CREATE TABLE IF NOT EXISTS conversations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            title VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        )

        # Create messages table
        cur.execute(
            """
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            conversation_id INTEGER REFERENCES conversations(id),
            role VARCHAR(50) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        )

        conn.commit()
        logger.info("Database setup completed successfully")

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error setting up database: {e}")
        using_memory_mode = True
        logger.warning("Falling back to in-memory storage mode")
    finally:
        if conn:
            DatabaseConnection.return_connection(conn)

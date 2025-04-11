import os
import time
import psycopg2
from psycopg2 import pool
from loguru import logger

import sys
sys.path.append("..")
from config import getEnv
class DatabaseConnection:
    _connection_pool = None
    _cache = {}

    @classmethod
    def initialize_pool(cls):
        if cls._connection_pool is None:
            try:
                # Increased connection pool size for better concurrency
                cls._connection_pool = pool.SimpleConnectionPool(
                    minconn=5,
                    maxconn=20,
                    dsn=getEnv("DATABASE_URL")
                )
                logger.info("Database connection pool initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing database pool: {e}")
                raise

    @classmethod
    def get_cache(cls, key):
        return cls._cache.get(key)

    @classmethod
    def set_cache(cls, key, value, ttl=300):  # 5 minutes TTL by default
        cls._cache[key] = {
            'value': value,
            'expires_at': time.time() + ttl
        }

    @classmethod
    def clear_expired_cache(cls):
        current_time = time.time()
        expired_keys = [k for k, v in cls._cache.items() 
                       if current_time > v['expires_at']]
        for k in expired_keys:
            del cls._cache[k]

    @classmethod
    def get_connection(cls):
        if cls._connection_pool is None:
            cls.initialize_pool()
        return cls._connection_pool.getconn()

    @classmethod
    def return_connection(cls, connection):
        cls._connection_pool.putconn(connection)

    @classmethod
    def close_all_connections(cls):
        if cls._connection_pool is not None:
            cls._connection_pool.closeall()
            logger.info("All database connections closed")

def setup_database():
    """Setup database tables"""
    try:
        conn = DatabaseConnection.get_connection()
        cur = conn.cursor()

        # Create users table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # Create chat history table with user_id reference
        cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            conversation_id VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Add indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_chat_history_conversation_id ON chat_history(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON chat_history(timestamp)
        """)

        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            DatabaseConnection.return_connection(conn)
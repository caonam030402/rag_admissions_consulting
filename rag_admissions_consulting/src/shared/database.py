import os
import psycopg2
from psycopg2 import pool
from loguru import logger

import sys
sys.path.append("..")
from config import getEnv
class DatabaseConnection:
    _connection_pool = None

    @classmethod
    def initialize_pool(cls):
        if cls._connection_pool is None:
            try:
                cls._connection_pool = pool.SimpleConnectionPool(
                    minconn=1,
                    maxconn=10,
                    dsn=getEnv("DATABASE_URL")
                )
                logger.info("Database connection pool initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing database pool: {e}")
                raise

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
        )
        """)

        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            DatabaseConnection.return_connection(conn)
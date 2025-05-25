import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.context_cache import context_cache


def test_cache():
    print("Testing ContextCache...")

    # Test tạo context manager
    context_manager = context_cache.get_or_create_context_manager(
        user_id=1, conversation_id="test-123", user_email="test@example.com"
    )

    print(f"Created context manager: {context_manager}")
    print(f"Total contexts: {len(context_cache.context_managers)}")

    # Test lấy lại context manager
    context_manager2 = context_cache.get_or_create_context_manager(
        user_id=1, conversation_id="test-123", user_email="test@example.com"
    )

    print(f"Retrieved context manager: {context_manager2}")
    print(f"Same instance? {context_manager is context_manager2}")
    print(f"Total contexts: {len(context_cache.context_managers)}")

    # Test stats
    stats = context_cache.get_cache_stats()
    print(f"Cache stats: {stats}")


if __name__ == "__main__":
    test_cache()

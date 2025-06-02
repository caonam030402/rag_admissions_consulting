#!/usr/bin/env python3

import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from utils.config_client import ConfigClient


def debug_url():
    """Debug the URL construction"""
    client = ConfigClient()

    print(f"🔍 Debug URL Construction:")
    print(f"Backend URL: {client.backend_url}")
    print(f"Config Endpoint: {client.config_endpoint}")
    print(f"Expected: http://localhost:5000/api/v1/chatbot-config/rag/config")

    # Test if we can construct URL properly
    import os

    backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
    config_endpoint = f"{backend_url}/api/v1/chatbot-config/rag/config"

    print(f"\n🧪 Manual Construction:")
    print(f"Backend URL from env: {backend_url}")
    print(f"Manual endpoint: {config_endpoint}")


if __name__ == "__main__":
    debug_url()

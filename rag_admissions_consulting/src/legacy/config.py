import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def getEnv(key: str, default_value: str = None) -> str:
    """
    Get environment variable value
    Args:
        key: Environment variable key
        default_value: Default value if key not found
    Returns:
        str: Environment variable value
    """
    value = os.getenv(key)
    if value is None:
        if default_value is not None:
            return default_value
        raise ValueError(f"Environment variable {key} not found")
    return value
from dotenv import load_dotenv
import os
load_dotenv()

listEnv = {
    "PINECONE_API_KEY": os.environ.get('PINECONE_API_KEY'),
    "GEMINI_API_KEY": os.environ.get('GEMINI_API_KEY')
}

def getEnv(key):
    value = listEnv[key]
    
    if key not in env_vars:
        raise KeyError(f"Unknown key: {key}")
    
    if not value:
        raise ValueError(f"Environment variable {key} is not set in .env file")
    
    return value


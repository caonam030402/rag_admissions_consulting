from dotenv import load_dotenv
import os
load_dotenv()

listEnv = {
    "PINECONE_API_KEY": os.environ.get('PINECONE_API_KEY'),
    "GEMINI_API_KEY": os.environ.get('GEMINI_API_KEY'),
    "OPENAI_API_KEY": os.environ.get('OPENAI_API_KEY'),
    "DATABASE_URL": os.environ.get('DATABASE_URL'),
}

def getEnv(key):
    if key not in listEnv:
        raise KeyError(f"Unknown key: {key}")
    
    value = listEnv[key]
    if not value:
        raise ValueError(f"Environment variable {key} is not set in .env file")
    
    return value


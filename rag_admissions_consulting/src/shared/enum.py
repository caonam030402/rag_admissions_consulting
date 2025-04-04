class ModelType(str):
    GEMINI = "gemini"
    OPENAI = "openai"
    HUGGINGFACE = "huggingface"
    OLLAMA = "ollama"
    
class FileDataType(str):
    CSV = "csv"
    PDF = "pdf"
    JSON = "json"

class RoleType(str):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
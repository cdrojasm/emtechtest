import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    
    model_config = SettingsConfigDict(
        env_file= ".env",
        env_file_encoding= "utf-8",
    )
    # BASE
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", None)
    # DB
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "password")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", 5432))
    DB_NAME: str = os.getenv("DB_NAME", "chat_db")
    # Debug test
    DEBUG: bool = os.getenv("DEBUG", False)
    MODE: str = os.getenv("MODE", "dev")
    # VECTOR STORE
    VECTOR_STORE_HOST: str = os.getenv("VECTOR_STORE_HOST", None)
    VECTOR_STORE_PORT: int = int(os.getenv("VECTOR_STORE_PORT", -1))
    VECTOR_STORE_COLLECTION_NAME: str = os.getenv("VECTOR_STORE_COLLECTION_NAME", "chat_collection")
    # LLM API 
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", None)

settings = Settings()
def enable_debugpy_if_needed():
    """
    Optionally enable debugpy if settings.DEBUG is True.
    This allows you to attach a remote debugger (like VS Code) to port 5678.
    """
    if settings.DEBUG and settings.MODE == "dev":
        print("Debug mode is enabled. Starting debugpy...", flush=True)
        import debugpy
        debugpy.listen(("0.0.0.0", 5678))
        debugpy.wait_for_client()
        print("Debugpy is active, attach your debugger to port 5678")
        
enable_debugpy_if_needed()
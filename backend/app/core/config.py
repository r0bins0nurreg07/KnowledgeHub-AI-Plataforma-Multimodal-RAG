from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]

class setting (BaseSettings):
    app_name: str
    app_version: str
    app_description: str
    app_environment: str
    debug: bool
    host: str
    port: int   
    database_url: str
    database_echo: bool = False
    secret_key: str
    access_token_expire_minutes: int

    openai_api_key: str | None = None
    openai_chat_model: str = "gpt-4o-mini"
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "document_chunks"
    max_upload_size_mb: int = 20


    model_config=SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding='utf-8',
        case_sensitive=False,
    )

@lru_cache
def get_setting()->setting:
    return setting()

settings=get_setting()



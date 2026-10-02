from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    app_name: str = "DealMemory API"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/dealmemory"
    cors_origins: Union[List[str], str] = ["http://localhost:5173"]
    jwt_secret_key: str = "dealmemory-fallback-secret-key-32-chars-min"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # Hindsight Experiential Memory
    hindsight_base_url: str = "https://api.hindsight.vectorize.io"
    hindsight_api_key: Union[str, None] = None
    hindsight_bank_id: Union[str, None] = None

    # Groq LLM
    groq_api_key: Union[str, None] = None
    groq_model: str = "openai/gpt-oss-120b"

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("DATABASE_URL="):
                v = v[len("DATABASE_URL="):].strip()
            if v.startswith("postgres://"):
                return "postgresql+psycopg://" + v[len("postgres://"):]
            elif v.startswith("postgresql://") and not v.startswith("postgresql+"):
                return "postgresql+psycopg://" + v[len("postgresql://"):]
        return v

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=(str(BACKEND_DIR / ".env"), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()

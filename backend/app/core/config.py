from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# backend/app/core/config.py -> parents[2] = backend/
_BACKEND_DIR = Path(__file__).resolve().parents[2]
_DEFAULT_MODEL_PIPELINE_PATH = _BACKEND_DIR / 'model_acv' / 'api python' / 'api python' / 'model_pipeline.py'


class Settings(BaseSettings):
    app_name: str = 'Stroke Risk Platform'
    environment: str = 'development'
    database_url: str = 'postgresql+psycopg://postgres:postgres@localhost:5432/stroke_risk_db'
    secret_key: str = 'change-me-in-production'
    algorithm: str = 'HS256'
    access_token_expire_minutes: int = 30
    cors_origins: Annotated[list[str], NoDecode] = ['http://localhost:5173']
    # Ruta al módulo que carga modelo_stroke.pkl (ver backend/model_acv). Configurable por
    # si el modelo se reubica; por defecto apunta a donde lo dejó el equipo.
    stroke_model_pipeline_path: str = str(_DEFAULT_MODEL_PIPELINE_PATH)

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', case_sensitive=False)

    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, list):
            return value
        return [origin.strip() for origin in value.split(',') if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
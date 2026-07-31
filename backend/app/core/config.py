from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = 'Stroke Risk Platform'
    environment: str = 'development'
    database_url: str = 'postgresql+psycopg://postgres:postgres@localhost:5432/stroke_risk_db'
    secret_key: str = 'change-me-in-production'
    algorithm: str = 'HS256'
    access_token_expire_minutes: int = 30
    cors_origins: list[str] = ['http://localhost:5173']

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
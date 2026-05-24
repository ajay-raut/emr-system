import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "MedRecord Pro"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://emr_admin:emr_secure_pass_2026@db:5432/emr_database",
    )

    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://frontend:5173",
    ]

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

"""Application Configuration"""

from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Supabase
    supabase_url: str
    supabase_service_key: str
    supabase_jwt_secret: str

    # ElevenLabs
    elevenlabs_api_key: str
    elevenlabs_agent_id_analytical: str
    elevenlabs_agent_id_warm: str
    elevenlabs_webhook_secret: str

    # Application
    api_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"
    environment: Literal["development", "production"] = "development"

    # Security
    tool_callback_secret: str

    # Optional
    swisseph_path: str = "/usr/share/swisseph"

    # DSGVO
    current_consent_version: str = "v1.0.0"
    voice_session_retention_days: int = 90
    audit_log_retention_years: int = 2

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

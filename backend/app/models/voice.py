"""Voice Chat Models"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, UUID4


class VoiceConsent(BaseModel):
    """Voice consent model"""
    user_id: UUID4
    consent_version: str
    consent_at: datetime
    consent_text: str
    withdrawn_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class VoiceSession(BaseModel):
    """Voice session model"""
    id: str  # Format: vs_xxxxx
    user_id: UUID4
    elevenlabs_session_id: Optional[str] = None
    elevenlabs_conversation_id: Optional[str] = None
    status: Literal["active", "completed", "failed", "expired"] = "active"
    voice_mode: Literal["analytical", "warm"]
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class VoiceAuditLog(BaseModel):
    """Voice audit log model"""
    id: UUID4
    user_id: Optional[UUID4] = None
    session_id: Optional[str] = None
    conversation_id: Optional[str] = None
    event_type: str
    data_accessed: Optional[dict] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

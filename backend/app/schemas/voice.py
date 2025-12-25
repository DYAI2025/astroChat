"""Voice Chat Schemas (Request/Response)"""

from datetime import datetime
from typing import Optional, Literal, Dict
from pydantic import BaseModel


# Request Schemas
class VoiceSessionRequest(BaseModel):
    """Request to create voice session"""
    voice_mode: Literal["analytical", "warm"] = "analytical"


class ToolCallRequest(BaseModel):
    """Request from ElevenLabs tool callback"""
    session_id: str
    conversation_id: str
    parameters: Dict


class PostCallWebhook(BaseModel):
    """Webhook payload from ElevenLabs post-call"""
    conversation_id: str
    session_id: Optional[str] = None
    duration_seconds: int
    ended_at: datetime
    status: str


# Response Schemas
class VoiceSessionResponse(BaseModel):
    """Response with voice session details"""
    signed_url: str
    signed_url_expires_at: datetime
    dynamic_variables: Dict[str, str]
    limits: Dict[str, int]
    session_id: str


class VoiceUsageResponse(BaseModel):
    """Response with voice usage statistics"""
    plan: str
    voice_minutes_monthly: int
    voice_minutes_used: int
    voice_minutes_remaining: int
    period_start: datetime
    period_end: datetime
    recent_sessions: list[Dict]


class ConsentRequest(BaseModel):
    """Request to grant consent"""
    consent_version: str
    consent_text: str


class ConsentResponse(BaseModel):
    """Response after granting consent"""
    user_id: str
    consent_version: str
    consent_at: datetime
    status: str


# ElevenLabs Schemas
class ElevenLabsSessionResponse(BaseModel):
    """Response from ElevenLabs session creation"""
    conversation_id: str
    signed_url: str
    expires_at: datetime

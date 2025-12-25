"""User and Profile Models"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, UUID4


class User(BaseModel):
    """User model (from auth.users)"""
    id: UUID4
    email: Optional[str] = None


class Profile(BaseModel):
    """User profile model"""
    id: UUID4
    display_name: Optional[str] = None
    locale: str = "de"
    timezone: str = "Europe/Berlin"
    created_at: datetime
    updated_at: datetime


class BirthData(BaseModel):
    """Birth data model"""
    user_id: UUID4
    birth_utc: datetime
    lat: float
    lon: float
    place_label: Optional[str] = None
    consent_version: str
    consent_at: datetime
    updated_at: datetime


class Entitlements(BaseModel):
    """User entitlements model"""
    user_id: UUID4
    plan: str  # 'free' | 'premium'
    status: str  # 'active' | 'past_due' | 'canceled'
    voice_minutes_monthly: int
    voice_minutes_used: int
    period_start: datetime
    period_end: datetime
    updated_at: datetime

"""Astrology Schemas"""

from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel


class NatalChartRequest(BaseModel):
    """Request to calculate natal chart"""
    birth_utc: datetime
    lat: float
    lon: float
    house_system: str = "placidus"


class NatalChartResponse(BaseModel):
    """Response with natal chart data"""
    planets: Dict[str, Any]
    ascendant: Dict[str, Any]
    midheaven: Dict[str, Any]
    houses: list[float]
    computed_at: datetime


class TransitRequest(BaseModel):
    """Request to calculate transits"""
    natal_chart_id: str
    transit_date: datetime = None  # Defaults to now


class TransitResponse(BaseModel):
    """Response with transit data"""
    aspects: list[Dict[str, Any]]
    computed_at: datetime

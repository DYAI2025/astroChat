"""Astrology Models"""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, UUID4


class NatalChart(BaseModel):
    """Natal chart model"""
    id: UUID4
    user_id: UUID4
    computed_at: datetime
    engine_version: str = "swisseph-2.10"
    zodiac: str = "tropical"
    house_system: str = "placidus"
    warnings: Dict[str, Any] = {}
    payload: Dict[str, Any]
    created_at: datetime

    def to_agent_format(self) -> dict:
        """Convert to format suitable for AI agent"""
        planets = self.payload.get("planets", {})

        return {
            planet_name: {
                "sign": data.get("sign"),
                "degree": round(data.get("degree", 0), 1),
                "house": data.get("house")
            }
            for planet_name, data in planets.items()
        }


class PlanetPosition(BaseModel):
    """Planet position"""
    sign: str
    degree: float
    lon_absolute: float
    house: Optional[int] = None


class Aspect(BaseModel):
    """Astrological aspect"""
    type: str  # 'conjunction', 'square', 'opposition', 'trine', 'sextile'
    transit_planet: str
    natal_planet: str
    orb: float
    exact_date: Optional[datetime] = None


class Transit(BaseModel):
    """Transit information"""
    aspects: list[Aspect]
    computed_at: datetime

    def to_agent_format(self) -> dict:
        """Convert to format suitable for AI agent"""
        result = {}

        for aspect in self.aspects:
            key = f"{aspect.transit_planet}_{aspect.type}_{aspect.natal_planet}"
            result[key] = {
                "type": aspect.type,
                "orb": round(aspect.orb, 1),
                "exact_date": aspect.exact_date.isoformat() if aspect.exact_date else None
            }

        return result

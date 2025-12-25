"""Astrology Service (Swiss Ephemeris Integration)"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
import swisseph as swe
from app.config import settings
from app.models.astro import PlanetPosition, Aspect, Transit
import logging

logger = logging.getLogger(__name__)


class AstroService:
    """Service for astrological calculations using Swiss Ephemeris"""

    # Zodiac signs (German)
    SIGNS = [
        "Widder", "Stier", "Zwillinge", "Krebs",
        "Löwe", "Jungfrau", "Waage", "Skorpion",
        "Schütze", "Steinbock", "Wassermann", "Fische"
    ]

    # Planets to calculate
    PLANETS = [
        (swe.SUN, "sun"),
        (swe.MOON, "moon"),
        (swe.MERCURY, "mercury"),
        (swe.VENUS, "venus"),
        (swe.MARS, "mars"),
        (swe.JUPITER, "jupiter"),
        (swe.SATURN, "saturn"),
        (swe.URANUS, "uranus"),
        (swe.NEPTUNE, "neptune"),
        (swe.PLUTO, "pluto"),
    ]

    # Major aspects
    ASPECTS = [
        ("conjunction", 0, 8),    # Orb: ±8°
        ("sextile", 60, 6),        # Orb: ±6°
        ("square", 90, 8),         # Orb: ±8°
        ("trine", 120, 8),         # Orb: ±8°
        ("opposition", 180, 8),    # Orb: ±8°
    ]

    def __init__(self):
        """Initialize Swiss Ephemeris"""
        # Set ephemeris path if configured
        if settings.swisseph_path:
            swe.set_ephe_path(settings.swisseph_path)
        logger.info("AstroService initialized")

    def calculate_natal_chart(
        self,
        birth_utc: datetime,
        lat: float,
        lon: float,
        house_system: str = "P"  # P = Placidus
    ) -> Dict[str, Any]:
        """
        Calculate natal chart using Swiss Ephemeris.

        Args:
            birth_utc: Birth time in UTC
            lat: Latitude
            lon: Longitude
            house_system: House system ('P' = Placidus, 'K' = Koch, etc.)

        Returns:
            Dictionary with planets, ascendant, midheaven, houses
        """
        try:
            # Calculate Julian Day
            jd = swe.julday(
                birth_utc.year,
                birth_utc.month,
                birth_utc.day,
                birth_utc.hour + birth_utc.minute / 60.0 + birth_utc.second / 3600.0
            )

            # Calculate planets
            planets = {}
            for planet_id, planet_name in self.PLANETS:
                result, ret_flag = swe.calc_ut(jd, planet_id)
                lon_deg = result[0]  # Ecliptic longitude

                sign, degree = self._to_zodiac(lon_deg)

                planets[planet_name] = {
                    "sign": sign,
                    "degree": round(degree, 2),
                    "lon_absolute": round(lon_deg, 6)
                }

            # Calculate houses (Placidus or other system)
            houses_cusps, ascmc = swe.houses(jd, lat, lon, house_system.encode())

            # Assign houses to planets
            for planet_name in planets:
                planet_lon = planets[planet_name]["lon_absolute"]
                house_num = self._find_house(planet_lon, houses_cusps)
                planets[planet_name]["house"] = house_num

            # Ascendant & Midheaven
            asc_sign, asc_deg = self._to_zodiac(ascmc[0])
            mc_sign, mc_deg = self._to_zodiac(ascmc[1])

            result = {
                "planets": planets,
                "ascendant": {
                    "sign": asc_sign,
                    "degree": round(asc_deg, 2),
                    "lon_absolute": round(ascmc[0], 6)
                },
                "midheaven": {
                    "sign": mc_sign,
                    "degree": round(mc_deg, 2),
                    "lon_absolute": round(ascmc[1], 6)
                },
                "houses": [round(h, 2) for h in houses_cusps]
            }

            logger.info(f"Natal chart calculated for {birth_utc}")
            return result

        except Exception as e:
            logger.error(f"Error calculating natal chart: {e}")
            raise

    def calculate_transits(
        self,
        natal_chart: Dict[str, Any],
        transit_date: Optional[datetime] = None
    ) -> Transit:
        """
        Calculate current transits to natal chart.

        Args:
            natal_chart: Natal chart payload
            transit_date: Date for transits (defaults to now)

        Returns:
            Transit object with aspects
        """
        try:
            if transit_date is None:
                transit_date = datetime.now(timezone.utc)

            # Calculate Julian Day for transit date
            jd = swe.julday(
                transit_date.year,
                transit_date.month,
                transit_date.day,
                transit_date.hour + transit_date.minute / 60.0
            )

            # Calculate current planet positions
            transiting_planets = {}
            for planet_id, planet_name in self.PLANETS:
                result, _ = swe.calc_ut(jd, planet_id)
                transiting_planets[planet_name] = result[0]

            # Find aspects
            aspects: List[Aspect] = []
            natal_planets = natal_chart.get("planets", {})

            for transit_name, transit_lon in transiting_planets.items():
                for natal_name, natal_data in natal_planets.items():
                    natal_lon = natal_data["lon_absolute"]

                    # Check each aspect type
                    for aspect_name, aspect_angle, orb in self.ASPECTS:
                        angle_diff = self._calculate_angle_diff(transit_lon, natal_lon)

                        aspect_orb = abs(angle_diff - aspect_angle)

                        if aspect_orb <= orb:
                            aspects.append(Aspect(
                                type=aspect_name,
                                transit_planet=transit_name,
                                natal_planet=natal_name,
                                orb=round(aspect_orb, 2)
                            ))

            logger.info(f"Calculated {len(aspects)} transits for {transit_date}")

            return Transit(
                aspects=aspects,
                computed_at=transit_date
            )

        except Exception as e:
            logger.error(f"Error calculating transits: {e}")
            raise

    def _to_zodiac(self, lon: float) -> tuple[str, float]:
        """Convert ecliptic longitude to zodiac sign + degree"""
        sign_index = int(lon / 30) % 12
        degree = lon % 30
        return self.SIGNS[sign_index], degree

    def _find_house(self, planet_lon: float, houses_cusps: list) -> int:
        """Find which house a planet is in"""
        for i in range(12):
            cusp_current = houses_cusps[i]
            cusp_next = houses_cusps[(i + 1) % 12]

            # Handle zodiac wrap-around
            if cusp_next < cusp_current:
                cusp_next += 360

            planet_lon_adjusted = planet_lon
            if planet_lon < cusp_current:
                planet_lon_adjusted += 360

            if cusp_current <= planet_lon_adjusted < cusp_next:
                return i + 1  # Houses are 1-indexed

        return 1  # Default to 1st house

    def _calculate_angle_diff(self, lon1: float, lon2: float) -> float:
        """Calculate smallest angle difference between two longitudes"""
        diff = abs(lon1 - lon2)
        if diff > 180:
            diff = 360 - diff
        return diff

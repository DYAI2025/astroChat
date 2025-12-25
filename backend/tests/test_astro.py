"""Tests for Astro Service"""

import pytest
from app.services.astro import AstroService
from datetime import datetime, timezone


def test_to_zodiac():
    """Test ecliptic longitude to zodiac conversion"""
    service = AstroService()

    # Test Aries (0-30°)
    sign, degree = service._to_zodiac(15.5)
    assert sign == "Widder"
    assert degree == pytest.approx(15.5)

    # Test Gemini (60-90°)
    sign, degree = service._to_zodiac(84.3)
    assert sign == "Zwillinge"
    assert degree == pytest.approx(24.3)

    # Test Pisces (330-360°)
    sign, degree = service._to_zodiac(342.1)
    assert sign == "Fische"
    assert degree == pytest.approx(12.1)


def test_calculate_angle_diff():
    """Test angle difference calculation"""
    service = AstroService()

    # 0° difference
    assert service._calculate_angle_diff(10, 10) == 0

    # 90° difference
    assert service._calculate_angle_diff(10, 100) == 90

    # Wrap-around (350° and 10° should be 20° apart)
    assert service._calculate_angle_diff(350, 10) == 20

    # 180° (should not exceed 180°)
    assert service._calculate_angle_diff(0, 180) == 180


def test_find_house():
    """Test house finding logic"""
    service = AstroService()

    # Mock houses cusps (simplified)
    houses_cusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

    # Planet at 45° should be in house 2
    house = service._find_house(45, houses_cusps)
    assert house == 2

    # Planet at 0° should be in house 1
    house = service._find_house(0, houses_cusps)
    assert house == 1

    # Planet at 355° should be in house 12 (wraps around)
    house = service._find_house(355, houses_cusps)
    assert house == 12


def test_calculate_natal_chart():
    """Test natal chart calculation (integration with Swiss Ephemeris)"""
    service = AstroService()

    # Example: June 15, 1990, 14:30 UTC, Berlin (52.52N, 13.40E)
    birth_utc = datetime(1990, 6, 15, 14, 30, 0, tzinfo=timezone.utc)
    lat = 52.52
    lon = 13.40

    result = service.calculate_natal_chart(birth_utc, lat, lon)

    # Verify structure
    assert "planets" in result
    assert "ascendant" in result
    assert "midheaven" in result
    assert "houses" in result

    # Verify planets
    assert "sun" in result["planets"]
    assert "moon" in result["planets"]

    # Verify planet structure
    sun = result["planets"]["sun"]
    assert "sign" in sun
    assert "degree" in sun
    assert "lon_absolute" in sun
    assert "house" in sun

    # Sun should be in Gemini (rough check)
    assert sun["sign"] == "Zwillinge"

    # Verify houses count
    assert len(result["houses"]) == 12


def test_calculate_transits():
    """Test transit calculation"""
    service = AstroService()

    # Mock natal chart
    natal_chart = {
        "planets": {
            "sun": {
                "sign": "Zwillinge",
                "degree": 24.3,
                "lon_absolute": 84.3
            },
            "moon": {
                "sign": "Fische",
                "degree": 12.1,
                "lon_absolute": 342.1
            }
        }
    }

    # Calculate current transits
    transits = service.calculate_transits(natal_chart)

    # Verify structure
    assert hasattr(transits, "aspects")
    assert hasattr(transits, "computed_at")

    # Aspects should be a list
    assert isinstance(transits.aspects, list)

    # Each aspect should have required fields
    for aspect in transits.aspects:
        assert hasattr(aspect, "type")
        assert hasattr(aspect, "transit_planet")
        assert hasattr(aspect, "natal_planet")
        assert hasattr(aspect, "orb")

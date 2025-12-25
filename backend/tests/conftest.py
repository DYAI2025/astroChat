"""Pytest configuration and fixtures"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock, patch
from app.main import app
from app.dependencies import get_supabase, get_current_user
from app.models.user import User
from datetime import datetime
import jwt
from app.config import settings


# Mock Supabase client
@pytest.fixture
def mock_supabase():
    """Mock Supabase client"""
    mock = Mock()
    mock.table = Mock(return_value=mock)
    mock.select = Mock(return_value=mock)
    mock.insert = Mock(return_value=mock)
    mock.update = Mock(return_value=mock)
    mock.delete = Mock(return_value=mock)
    mock.eq = Mock(return_value=mock)
    mock.is_ = Mock(return_value=mock)
    mock.order = Mock(return_value=mock)
    mock.limit = Mock(return_value=mock)
    mock.execute = Mock(return_value=Mock(data=[]))
    return mock


# Mock user
@pytest.fixture
def mock_user():
    """Mock authenticated user"""
    return User(
        id="550e8400-e29b-41d4-a716-446655440000",
        email="test@example.com"
    )


# Test client with overrides
@pytest.fixture
def client(mock_supabase, mock_user):
    """FastAPI test client with dependency overrides"""

    def override_get_supabase():
        return mock_supabase

    def override_get_current_user():
        return mock_user

    app.dependency_overrides[get_supabase] = override_get_supabase
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as test_client:
        yield test_client

    # Clean up
    app.dependency_overrides.clear()


# Auth headers
@pytest.fixture
def auth_headers():
    """Generate valid JWT token for testing"""
    payload = {
        "sub": "550e8400-e29b-41d4-a716-446655440000",
        "email": "test@example.com",
        "aud": "authenticated",
        "exp": datetime.utcnow().timestamp() + 3600
    }

    token = jwt.encode(
        payload,
        "test-secret",  # Mock secret
        algorithm="HS256"
    )

    return {"Authorization": f"Bearer {token}"}


# Sample data fixtures
@pytest.fixture
def sample_natal_chart():
    """Sample natal chart data"""
    return {
        "id": "chart-123",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "computed_at": datetime.utcnow().isoformat(),
        "payload": {
            "planets": {
                "sun": {
                    "sign": "Zwillinge",
                    "degree": 24.3,
                    "lon_absolute": 84.3,
                    "house": 10
                },
                "moon": {
                    "sign": "Fische",
                    "degree": 12.1,
                    "lon_absolute": 342.1,
                    "house": 7
                }
            },
            "ascendant": {
                "sign": "Jungfrau",
                "degree": 5.8,
                "lon_absolute": 155.8
            }
        }
    }


@pytest.fixture
def sample_entitlements():
    """Sample entitlements data"""
    return {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "plan": "premium",
        "status": "active",
        "voice_minutes_monthly": 60,
        "voice_minutes_used": 12,
        "period_start": "2025-01-01T00:00:00Z",
        "period_end": "2025-02-01T00:00:00Z"
    }


@pytest.fixture
def sample_voice_consent():
    """Sample voice consent data"""
    return {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "consent_version": "v1.0.0",
        "consent_at": datetime.utcnow().isoformat(),
        "consent_text": "Ich stimme der Nutzung meiner Daten zu.",
        "withdrawn_at": None
    }

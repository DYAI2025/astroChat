"""Integration tests for Voice API endpoints"""

import pytest
from unittest.mock import Mock, patch
from datetime import datetime


def test_create_voice_session_success(client, mock_supabase, sample_voice_consent, sample_entitlements, sample_natal_chart):
    """Test successful voice session creation"""
    # Setup mocks
    def mock_execute():
        # Return different data based on table name
        call_args = str(mock_supabase.table.call_args)

        if "voice_consents" in call_args:
            return Mock(data=[sample_voice_consent])
        elif "entitlements" in call_args:
            return Mock(data=[sample_entitlements])
        elif "natal_charts" in call_args:
            return Mock(data=[sample_natal_chart])
        elif "profiles" in call_args:
            return Mock(data=[{"display_name": "TestUser"}])
        elif "voice_sessions" in call_args:
            return Mock(data=[{"id": "session-123"}])
        return Mock(data=[])

    mock_supabase.execute.side_effect = mock_execute

    # Make request
    response = client.post(
        "/v1/voice/session",
        json={"voice_mode": "analytical"}
    )

    # Assertions
    assert response.status_code == 200
    data = response.json()

    assert "signed_url" in data
    assert "session_id" in data
    assert "limits" in data
    assert data["limits"]["minutes_remaining"] == 48  # 60 - 12


def test_create_voice_session_no_consent(client, mock_supabase, sample_entitlements, sample_natal_chart):
    """Test voice session creation without consent"""
    # Setup mocks - no consent
    def mock_execute():
        call_args = str(mock_supabase.table.call_args)

        if "voice_consents" in call_args:
            return Mock(data=[])  # No consent
        elif "entitlements" in call_args:
            return Mock(data=[sample_entitlements])
        elif "natal_charts" in call_args:
            return Mock(data=[sample_natal_chart])
        return Mock(data=[])

    mock_supabase.execute.side_effect = mock_execute

    # Make request
    response = client.post(
        "/v1/voice/session",
        json={"voice_mode": "analytical"}
    )

    # Should return 403 Forbidden
    assert response.status_code == 403
    data = response.json()
    assert "consent" in data["detail"]["error"]


def test_create_voice_session_free_plan(client, mock_supabase, sample_voice_consent, sample_natal_chart):
    """Test voice session creation with free plan (should fail)"""
    # Setup mocks
    free_entitlements = {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "plan": "free",  # Free plan
        "status": "active",
        "voice_minutes_monthly": 3,
        "voice_minutes_used": 0
    }

    def mock_execute():
        call_args = str(mock_supabase.table.call_args)

        if "voice_consents" in call_args:
            return Mock(data=[sample_voice_consent])
        elif "entitlements" in call_args:
            return Mock(data=[free_entitlements])
        elif "natal_charts" in call_args:
            return Mock(data=[sample_natal_chart])
        return Mock(data=[])

    mock_supabase.execute.side_effect = mock_execute

    # Make request
    response = client.post(
        "/v1/voice/session",
        json={"voice_mode": "analytical"}
    )

    # Should return 402 Payment Required
    assert response.status_code == 402


def test_create_voice_session_quota_exceeded(client, mock_supabase, sample_voice_consent, sample_natal_chart):
    """Test voice session creation with quota exceeded"""
    # Setup mocks
    exceeded_entitlements = {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "plan": "premium",
        "status": "active",
        "voice_minutes_monthly": 60,
        "voice_minutes_used": 60  # All used up
    }

    def mock_execute():
        call_args = str(mock_supabase.table.call_args)

        if "voice_consents" in call_args:
            return Mock(data=[sample_voice_consent])
        elif "entitlements" in call_args:
            return Mock(data=[exceeded_entitlements])
        elif "natal_charts" in call_args:
            return Mock(data=[sample_natal_chart])
        return Mock(data=[])

    mock_supabase.execute.side_effect = mock_execute

    # Make request
    response = client.post(
        "/v1/voice/session",
        json={"voice_mode": "analytical"}
    )

    # Should return 429 Too Many Requests
    assert response.status_code == 429


def test_get_voice_usage_success(client, mock_supabase, sample_entitlements):
    """Test getting voice usage statistics"""
    # Setup mocks
    sessions_data = [
        {
            "id": "session-1",
            "started_at": "2025-01-20T10:00:00Z",
            "ended_at": "2025-01-20T10:07:00Z",
            "duration_seconds": 420,
            "voice_mode": "analytical",
            "status": "completed"
        }
    ]

    def mock_execute():
        call_args = str(mock_supabase.table.call_args)

        if "entitlements" in call_args:
            return Mock(data=[sample_entitlements])
        elif "voice_sessions" in call_args:
            return Mock(data=sessions_data)
        return Mock(data=[])

    mock_supabase.execute.side_effect = mock_execute

    # Make request
    response = client.get("/v1/voice/usage")

    # Assertions
    assert response.status_code == 200
    data = response.json()

    assert data["plan"] == "premium"
    assert data["voice_minutes_monthly"] == 60
    assert data["voice_minutes_used"] == 12
    assert data["voice_minutes_remaining"] == 48
    assert len(data["recent_sessions"]) == 1
    assert data["recent_sessions"][0]["duration_minutes"] == 7  # ceil(420/60)

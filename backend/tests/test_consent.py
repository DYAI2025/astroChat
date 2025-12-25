"""Tests for Consent Service"""

import pytest
from app.services.consent import ConsentService, ConsentRequiredException, ConsentOutdatedException
from unittest.mock import Mock
from datetime import datetime


@pytest.mark.asyncio
async def test_check_voice_consent_valid(mock_supabase, sample_voice_consent):
    """Test checking valid consent"""
    # Setup mock response
    mock_supabase.execute.return_value.data = [sample_voice_consent]

    service = ConsentService(mock_supabase)

    # Should not raise exception
    result = await service.check_voice_consent(sample_voice_consent["user_id"])
    assert result is True


@pytest.mark.asyncio
async def test_check_voice_consent_missing(mock_supabase):
    """Test checking consent when none exists"""
    # Setup mock response - no consent
    mock_supabase.execute.return_value.data = []

    service = ConsentService(mock_supabase)

    # Should raise ConsentRequiredException
    with pytest.raises(ConsentRequiredException):
        await service.check_voice_consent("user-123")


@pytest.mark.asyncio
async def test_check_voice_consent_outdated(mock_supabase, sample_voice_consent):
    """Test checking outdated consent"""
    # Setup mock response with outdated version
    outdated_consent = sample_voice_consent.copy()
    outdated_consent["consent_version"] = "v0.9.0"
    mock_supabase.execute.return_value.data = [outdated_consent]

    service = ConsentService(mock_supabase)

    # Should raise ConsentOutdatedException
    with pytest.raises(ConsentOutdatedException):
        await service.check_voice_consent(sample_voice_consent["user_id"])


@pytest.mark.asyncio
async def test_grant_consent(mock_supabase):
    """Test granting consent"""
    # Setup mock response
    consent_data = {
        "user_id": "user-123",
        "consent_version": "v1.0.0",
        "consent_text": "I agree",
        "consent_at": datetime.utcnow().isoformat(),
        "withdrawn_at": None
    }
    mock_supabase.execute.return_value.data = [consent_data]

    service = ConsentService(mock_supabase)

    result = await service.grant_consent(
        user_id="user-123",
        consent_version="v1.0.0",
        consent_text="I agree"
    )

    assert result.user_id == "user-123"
    assert result.consent_version == "v1.0.0"


@pytest.mark.asyncio
async def test_withdraw_consent(mock_supabase):
    """Test withdrawing consent"""
    service = ConsentService(mock_supabase)

    result = await service.withdraw_consent("user-123")

    assert result is True
    # Verify update was called
    mock_supabase.update.assert_called()

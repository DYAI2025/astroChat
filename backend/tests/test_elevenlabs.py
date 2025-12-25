"""Tests for ElevenLabs Service"""

import pytest
from app.services.elevenlabs import validate_elevenlabs_signature, ElevenLabsService
import hmac
import hashlib


def test_validate_elevenlabs_signature_valid():
    """Test valid signature validation"""
    secret = "test-secret"
    payload = b'{"test": "data"}'

    # Generate valid signature
    sig_hash = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    signature = f"v1={sig_hash}"

    assert validate_elevenlabs_signature(signature, payload, secret) is True


def test_validate_elevenlabs_signature_invalid():
    """Test invalid signature validation"""
    secret = "test-secret"
    payload = b'{"test": "data"}'
    signature = "v1=invalid_hash"

    assert validate_elevenlabs_signature(signature, payload, secret) is False


def test_validate_elevenlabs_signature_missing():
    """Test missing signature"""
    assert validate_elevenlabs_signature(None, b"data", "secret") is False


def test_validate_elevenlabs_signature_wrong_version():
    """Test wrong signature version"""
    signature = "v2=somehash"
    assert validate_elevenlabs_signature(signature, b"data", "secret") is False


def test_validate_elevenlabs_signature_malformed():
    """Test malformed signature"""
    signature = "invalid-format"
    assert validate_elevenlabs_signature(signature, b"data", "secret") is False


@pytest.mark.asyncio
async def test_create_session():
    """Test ElevenLabs session creation"""
    service = ElevenLabsService()

    natal_chart = {
        "planets": {
            "sun": {"sign": "Zwillinge", "degree": 24.3}
        }
    }

    result = await service.create_session(
        user_id="user-123",
        voice_mode="analytical",
        tool_callback_url="https://example.com/tool",
        natal_chart=natal_chart
    )

    # Verify response structure
    assert hasattr(result, "conversation_id")
    assert hasattr(result, "signed_url")
    assert hasattr(result, "expires_at")

    # Conversation ID should start with "conv_"
    assert result.conversation_id.startswith("conv_")

    # Signed URL should be present
    assert "elevenlabs.io" in result.signed_url

"""Voice Chat API Routes"""

from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from supabase import Client
from app.dependencies import get_current_user, get_supabase, get_client_info
from app.models.user import User
from app.schemas.voice import VoiceSessionRequest, VoiceSessionResponse, VoiceUsageResponse
from app.services.consent import ConsentService
from app.services.elevenlabs import ElevenLabsService
from app.services.astro import AstroService
from app.services.audit import AuditService
from app.config import settings
import secrets
from math import ceil
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/voice", tags=["voice"])


@router.post("/session", response_model=VoiceSessionResponse)
async def create_voice_session(
    request_data: VoiceSessionRequest,
    request: Request,
    user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Create a new voice chat session.

    Steps:
    1. Check voice consent
    2. Check entitlements (plan, minutes)
    3. Load natal chart
    4. Create ElevenLabs session
    5. Save session to DB
    6. Create audit log

    Returns:
        VoiceSessionResponse with signed URL and usage limits
    """
    try:
        # Initialize services
        consent_service = ConsentService(supabase)
        elevenlabs_service = ElevenLabsService()
        astro_service = AstroService()
        audit_service = AuditService(supabase)

        # 1. Check consent
        await consent_service.check_voice_consent(str(user.id))

        # 2. Check entitlements
        entitlements_response = supabase.table("entitlements") \
            .select("*") \
            .eq("user_id", str(user.id)) \
            .execute()

        if not entitlements_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Keine Entitlements gefunden"
            )

        entitlements = entitlements_response.data[0]

        # Check plan
        if entitlements["plan"] != "premium":
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Premium-Abo erforderlich für Voice-Features"
            )

        # Check minutes
        remaining = entitlements["voice_minutes_monthly"] - entitlements["voice_minutes_used"]
        if remaining <= 0:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Monatliche Voice-Minuten aufgebraucht"
            )

        # 3. Load natal chart
        natal_chart_response = supabase.table("natal_charts") \
            .select("*") \
            .eq("user_id", str(user.id)) \
            .order("computed_at", desc=True) \
            .limit(1) \
            .execute()

        if not natal_chart_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bitte Geburtsdaten eingeben"
            )

        natal_chart = natal_chart_response.data[0]

        # Get profile for display name
        profile_response = supabase.table("profiles") \
            .select("display_name") \
            .eq("id", str(user.id)) \
            .execute()

        display_name = "Sternenwanderer"
        if profile_response.data:
            display_name = profile_response.data[0].get("display_name") or "Sternenwanderer"

        # 4. Create ElevenLabs session
        session_id = f"vs_{secrets.token_urlsafe(16)}"
        tool_callback_url = f"{settings.api_url}/v1/elevenlabs/tool/get_context"

        elevenlabs_response = await elevenlabs_service.create_session(
            user_id=str(user.id),
            voice_mode=request_data.voice_mode,
            tool_callback_url=tool_callback_url,
            natal_chart=natal_chart["payload"]
        )

        # 5. Save session to DB
        session_data = {
            "id": session_id,
            "user_id": str(user.id),
            "elevenlabs_session_id": elevenlabs_response.conversation_id,
            "status": "active",
            "voice_mode": request_data.voice_mode,
            "started_at": datetime.utcnow().isoformat()
        }

        supabase.table("voice_sessions").insert(session_data).execute()

        # 6. Audit log
        client_info = await get_client_info(request)
        await audit_service.log_session_created(
            user_id=str(user.id),
            session_id=session_id,
            voice_mode=request_data.voice_mode,
            ip_address=client_info["ip_address"],
            user_agent=client_info["user_agent"]
        )

        # Extract sun sign for dynamic variables
        sun_sign = natal_chart["payload"].get("planets", {}).get("sun", {}).get("sign", "Unknown")

        return VoiceSessionResponse(
            signed_url=elevenlabs_response.signed_url,
            signed_url_expires_at=elevenlabs_response.expires_at,
            dynamic_variables={
                "user_name": display_name,
                "sun_sign": sun_sign
            },
            limits={
                "minutes_monthly_total": entitlements["voice_minutes_monthly"],
                "minutes_monthly_used": entitlements["voice_minutes_used"],
                "minutes_remaining": remaining
            },
            session_id=session_id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating voice session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Interner Serverfehler"
        )


@router.get("/usage", response_model=VoiceUsageResponse)
async def get_voice_usage(
    user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get voice usage statistics for current user.

    Returns:
        VoiceUsageResponse with plan, minutes, and recent sessions
    """
    try:
        # Get entitlements
        entitlements_response = supabase.table("entitlements") \
            .select("*") \
            .eq("user_id", str(user.id)) \
            .execute()

        if not entitlements_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Keine Entitlements gefunden"
            )

        entitlements = entitlements_response.data[0]

        # Get recent sessions
        sessions_response = supabase.table("voice_sessions") \
            .select("id, started_at, ended_at, duration_seconds, voice_mode, status") \
            .eq("user_id", str(user.id)) \
            .order("started_at", desc=True) \
            .limit(10) \
            .execute()

        recent_sessions = []
        for session in sessions_response.data:
            duration_minutes = 0
            if session.get("duration_seconds"):
                duration_minutes = ceil(session["duration_seconds"] / 60)

            recent_sessions.append({
                "id": session["id"],
                "started_at": session["started_at"],
                "ended_at": session.get("ended_at"),
                "duration_minutes": duration_minutes,
                "voice_mode": session["voice_mode"],
                "status": session["status"]
            })

        remaining = entitlements["voice_minutes_monthly"] - entitlements["voice_minutes_used"]

        return VoiceUsageResponse(
            plan=entitlements["plan"],
            voice_minutes_monthly=entitlements["voice_minutes_monthly"],
            voice_minutes_used=entitlements["voice_minutes_used"],
            voice_minutes_remaining=remaining,
            period_start=entitlements["period_start"],
            period_end=entitlements["period_end"],
            recent_sessions=recent_sessions
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting voice usage: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Interner Serverfehler"
        )

"""ElevenLabs Integration Routes (Tool Callbacks & Webhooks)"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from supabase import Client
from app.dependencies import get_supabase
from app.schemas.voice import ToolCallRequest, PostCallWebhook
from app.services.elevenlabs import validate_elevenlabs_signature
from app.services.astro import AstroService
from app.services.audit import AuditService
from app.config import settings
from math import ceil
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/elevenlabs", tags=["elevenlabs"])


@router.post("/tool/get_context")
async def get_context_tool(
    request: Request,
    body: ToolCallRequest,
    supabase: Client = Depends(get_supabase)
):
    """
    Tool callback for ElevenLabs agent to get user context.

    This endpoint is called by the ElevenLabs AI agent during conversations
    when it needs access to the user's astrological data.

    Security:
        - Validates ElevenLabs signature
        - Validates session
        - DSGVO: Only returns minimal necessary data
        - Creates audit log

    Args:
        body: ToolCallRequest with session_id and data_types

    Returns:
        Dictionary with requested user context (natal_chart, transits, profile)
    """
    try:
        # 1. Validate ElevenLabs signature
        signature = request.headers.get("x-elevenlabs-signature")
        raw_body = await request.body()

        if not validate_elevenlabs_signature(
            signature,
            raw_body,
            settings.elevenlabs_webhook_secret
        ):
            logger.warning("Invalid ElevenLabs signature")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid signature"
            )

        # 2. Validate session
        session_response = supabase.table("voice_sessions") \
            .select("*") \
            .eq("id", body.session_id) \
            .execute()

        if not session_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        session = session_response.data[0]

        if session["status"] != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session is not active"
            )

        user_id = session["user_id"]

        # Update session with conversation_id if not set
        if not session.get("elevenlabs_conversation_id"):
            supabase.table("voice_sessions") \
                .update({"elevenlabs_conversation_id": body.conversation_id}) \
                .eq("id", body.session_id) \
                .execute()

        # 3. Gather requested data
        response_data = {}
        data_types = body.parameters.get("data_types", [])

        # Profile data
        if "profile" in data_types:
            profile_response = supabase.table("profiles") \
                .select("display_name, locale") \
                .eq("id", user_id) \
                .execute()

            if profile_response.data:
                profile = profile_response.data[0]
                response_data["user_context"] = {
                    "display_name": profile.get("display_name") or "Sternenwanderer",
                    "locale": profile.get("locale", "de")
                }

        # Natal chart data
        if "natal_chart" in data_types:
            natal_chart_response = supabase.table("natal_charts") \
                .select("payload") \
                .eq("user_id", user_id) \
                .order("computed_at", desc=True) \
                .limit(1) \
                .execute()

            if natal_chart_response.data:
                natal_chart = natal_chart_response.data[0]["payload"]

                # Convert to agent-friendly format (data minimization)
                planets = natal_chart.get("planets", {})
                response_data["natal_chart"] = {
                    planet_name: {
                        "sign": data.get("sign"),
                        "degree": round(data.get("degree", 0), 1),
                        "house": data.get("house")
                    }
                    for planet_name, data in planets.items()
                }

                # Add ascendant and midheaven
                if "ascendant" in natal_chart:
                    response_data["natal_chart"]["ascendant"] = {
                        "sign": natal_chart["ascendant"].get("sign"),
                        "degree": round(natal_chart["ascendant"].get("degree", 0), 1)
                    }

                if "midheaven" in natal_chart:
                    response_data["natal_chart"]["midheaven"] = {
                        "sign": natal_chart["midheaven"].get("sign"),
                        "degree": round(natal_chart["midheaven"].get("degree", 0), 1)
                    }

        # Current transits
        if "current_transits" in data_types:
            # Get natal chart for transit calculation
            natal_chart_response = supabase.table("natal_charts") \
                .select("payload") \
                .eq("user_id", user_id) \
                .order("computed_at", desc=True) \
                .limit(1) \
                .execute()

            if natal_chart_response.data:
                astro_service = AstroService()
                natal_chart = natal_chart_response.data[0]["payload"]

                # Calculate current transits
                transits = astro_service.calculate_transits(natal_chart)

                # Convert to agent-friendly format
                transit_data = {}
                for aspect in transits.aspects:
                    key = f"{aspect.transit_planet}_{aspect.type}_{aspect.natal_planet}"
                    transit_data[key] = {
                        "type": aspect.type,
                        "transit_planet": aspect.transit_planet,
                        "natal_planet": aspect.natal_planet,
                        "orb": round(aspect.orb, 1)
                    }

                response_data["current_transits"] = transit_data

        # 4. Create audit log (DSGVO)
        audit_service = AuditService(supabase)
        await audit_service.log_context_accessed(
            user_id=user_id,
            session_id=body.session_id,
            conversation_id=body.conversation_id,
            data_types=data_types,
            ip_address=request.client.host if request.client else None
        )

        logger.info(f"Context accessed for user {user_id}, session {body.session_id}")

        return response_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_context_tool: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal error"
        )


@router.post("/webhook/post-call")
async def post_call_webhook(
    request: Request,
    body: PostCallWebhook,
    supabase: Client = Depends(get_supabase)
):
    """
    Webhook endpoint called by ElevenLabs after conversation ends.

    Updates:
        - Voice session status
        - Usage statistics (minutes used)
        - Audit log

    Security:
        - Validates ElevenLabs signature
    """
    try:
        # 1. Validate signature
        signature = request.headers.get("x-elevenlabs-signature")
        raw_body = await request.body()

        if not validate_elevenlabs_signature(
            signature,
            raw_body,
            settings.elevenlabs_webhook_secret
        ):
            logger.warning("Invalid webhook signature")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid signature"
            )

        # 2. Find session
        # Try by session_id first, then by conversation_id
        session_response = None

        if body.session_id:
            session_response = supabase.table("voice_sessions") \
                .select("*") \
                .eq("id", body.session_id) \
                .execute()

        if not session_response or not session_response.data:
            # Fallback: find by conversation_id
            session_response = supabase.table("voice_sessions") \
                .select("*") \
                .eq("elevenlabs_conversation_id", body.conversation_id) \
                .execute()

        if not session_response or not session_response.data:
            logger.warning(f"Session not found for conversation {body.conversation_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        session = session_response.data[0]
        user_id = session["user_id"]
        session_id = session["id"]

        # 3. Calculate usage
        minutes_used = ceil(body.duration_seconds / 60)

        # 4. Update entitlements
        entitlements_response = supabase.table("entitlements") \
            .select("*") \
            .eq("user_id", user_id) \
            .execute()

        if entitlements_response.data:
            current_used = entitlements_response.data[0]["voice_minutes_used"]
            new_used = current_used + minutes_used

            supabase.table("entitlements") \
                .update({"voice_minutes_used": new_used}) \
                .eq("user_id", user_id) \
                .execute()

        # 5. Update session
        supabase.table("voice_sessions") \
            .update({
                "status": "completed",
                "ended_at": body.ended_at.isoformat(),
                "duration_seconds": body.duration_seconds,
                "elevenlabs_conversation_id": body.conversation_id
            }) \
            .eq("id", session_id) \
            .execute()

        # 6. Audit log
        audit_service = AuditService(supabase)
        await audit_service.log_session_ended(
            user_id=user_id,
            session_id=session_id,
            duration_seconds=body.duration_seconds,
            minutes_used=minutes_used
        )

        logger.info(f"Session {session_id} completed: {minutes_used} minutes used")

        return {"status": "ok", "minutes_used": minutes_used}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in post_call_webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal error"
        )

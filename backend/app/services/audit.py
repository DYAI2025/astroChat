"""Audit Logging Service (DSGVO Art. 5(2))"""

from datetime import datetime
from typing import Optional, Dict, Any
from supabase import Client
from uuid import uuid4
import logging

logger = logging.getLogger(__name__)


class AuditService:
    """Service for DSGVO-compliant audit logging"""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def log_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        conversation_id: Optional[str] = None,
        data_accessed: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> str:
        """
        Log an audit event.

        Args:
            event_type: Type of event (e.g., 'session_created', 'context_accessed')
            user_id: User UUID
            session_id: Voice session ID
            conversation_id: ElevenLabs conversation ID
            data_accessed: Details about accessed data
            ip_address: Client IP address
            user_agent: Client user agent

        Returns:
            Log entry ID
        """
        try:
            log_id = str(uuid4())

            log_entry = {
                "id": log_id,
                "event_type": event_type,
                "user_id": user_id,
                "session_id": session_id,
                "conversation_id": conversation_id,
                "data_accessed": data_accessed,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "created_at": datetime.utcnow().isoformat()
            }

            # Insert into database
            self.supabase.table("voice_audit_logs") \
                .insert(log_entry) \
                .execute()

            logger.info(f"Audit log created: {event_type} for user {user_id}")
            return log_id

        except Exception as e:
            # Non-critical: log but don't fail the request
            logger.error(f"Failed to create audit log: {e}")
            return ""

    async def log_session_created(
        self,
        user_id: str,
        session_id: str,
        voice_mode: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> str:
        """Log session creation event"""
        return await self.log_event(
            event_type="session_created",
            user_id=user_id,
            session_id=session_id,
            data_accessed={"voice_mode": voice_mode},
            ip_address=ip_address,
            user_agent=user_agent
        )

    async def log_context_accessed(
        self,
        user_id: str,
        session_id: str,
        conversation_id: str,
        data_types: list[str],
        ip_address: Optional[str] = None
    ) -> str:
        """Log context access event"""
        return await self.log_event(
            event_type="context_accessed",
            user_id=user_id,
            session_id=session_id,
            conversation_id=conversation_id,
            data_accessed={
                "fields": data_types,
                "reason": "elevenlabs_tool_call"
            },
            ip_address=ip_address
        )

    async def log_session_ended(
        self,
        user_id: str,
        session_id: str,
        duration_seconds: int,
        minutes_used: int
    ) -> str:
        """Log session end event"""
        return await self.log_event(
            event_type="session_ended",
            user_id=user_id,
            session_id=session_id,
            data_accessed={
                "duration_seconds": duration_seconds,
                "minutes_used": minutes_used
            }
        )

    async def log_consent_granted(
        self,
        user_id: str,
        consent_version: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> str:
        """Log consent granted event"""
        return await self.log_event(
            event_type="consent_granted",
            user_id=user_id,
            data_accessed={"consent_version": consent_version},
            ip_address=ip_address,
            user_agent=user_agent
        )

    async def log_consent_withdrawn(
        self,
        user_id: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> str:
        """Log consent withdrawn event"""
        return await self.log_event(
            event_type="consent_withdrawn",
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent
        )

    async def get_user_audit_logs(
        self,
        user_id: str,
        limit: int = 50
    ) -> list[Dict[str, Any]]:
        """Get audit logs for a user"""
        try:
            response = self.supabase.table("voice_audit_logs") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .limit(limit) \
                .execute()

            return response.data

        except Exception as e:
            logger.error(f"Error fetching audit logs: {e}")
            return []

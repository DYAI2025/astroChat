"""Consent Management Service (DSGVO Compliance)"""

from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status
from supabase import Client
from app.config import settings
from app.models.voice import VoiceConsent
import logging

logger = logging.getLogger(__name__)


class ConsentRequiredException(HTTPException):
    """Exception raised when user consent is required"""

    def __init__(self, message: str = "Bitte stimme der Nutzung deiner Geburtsdaten für Voice-Gespräche zu."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "consent_required", "message": message}
        )


class ConsentOutdatedException(HTTPException):
    """Exception raised when consent version is outdated"""

    def __init__(self, message: str = "Bitte bestätige die aktualisierte Datenschutzerklärung."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "consent_outdated", "message": message}
        )


class ConsentService:
    """Service for managing user consents"""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def check_voice_consent(self, user_id: str) -> bool:
        """
        Check if user has valid voice consent.

        Args:
            user_id: User UUID

        Returns:
            True if consent is valid

        Raises:
            ConsentRequiredException: If no consent exists or withdrawn
            ConsentOutdatedException: If consent version is outdated
        """
        try:
            # Query consent
            response = self.supabase.table("voice_consents") \
                .select("*") \
                .eq("user_id", user_id) \
                .is_("withdrawn_at", "null") \
                .execute()

            if not response.data:
                logger.info(f"No active consent for user {user_id}")
                raise ConsentRequiredException()

            consent = response.data[0]

            # Check version
            if consent["consent_version"] != settings.current_consent_version:
                logger.info(f"Outdated consent version for user {user_id}: {consent['consent_version']}")
                raise ConsentOutdatedException()

            logger.info(f"Valid consent found for user {user_id}")
            return True

        except (ConsentRequiredException, ConsentOutdatedException):
            raise
        except Exception as e:
            logger.error(f"Error checking consent: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Fehler bei der Consent-Prüfung"
            )

    async def grant_consent(
        self,
        user_id: str,
        consent_version: str,
        consent_text: str
    ) -> VoiceConsent:
        """
        Grant or update voice consent.

        Args:
            user_id: User UUID
            consent_version: Consent version (e.g., "v1.0.0")
            consent_text: Full consent text

        Returns:
            VoiceConsent object
        """
        try:
            now = datetime.utcnow()

            # Upsert consent
            response = self.supabase.table("voice_consents") \
                .upsert({
                    "user_id": user_id,
                    "consent_version": consent_version,
                    "consent_text": consent_text,
                    "consent_at": now.isoformat(),
                    "withdrawn_at": None
                }) \
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Fehler beim Speichern des Consents"
                )

            logger.info(f"Consent granted for user {user_id}, version {consent_version}")

            return VoiceConsent(**response.data[0])

        except Exception as e:
            logger.error(f"Error granting consent: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Fehler beim Erteilen des Consents"
            )

    async def withdraw_consent(self, user_id: str) -> bool:
        """
        Withdraw voice consent.

        Args:
            user_id: User UUID

        Returns:
            True if successful
        """
        try:
            now = datetime.utcnow()

            response = self.supabase.table("voice_consents") \
                .update({"withdrawn_at": now.isoformat()}) \
                .eq("user_id", user_id) \
                .execute()

            logger.info(f"Consent withdrawn for user {user_id}")
            return True

        except Exception as e:
            logger.error(f"Error withdrawing consent: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Fehler beim Widerrufen des Consents"
            )

    async def get_consent(self, user_id: str) -> Optional[VoiceConsent]:
        """Get current consent for user"""
        try:
            response = self.supabase.table("voice_consents") \
                .select("*") \
                .eq("user_id", user_id) \
                .execute()

            if not response.data:
                return None

            return VoiceConsent(**response.data[0])

        except Exception as e:
            logger.error(f"Error getting consent: {e}")
            return None

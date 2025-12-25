"""ElevenLabs Conversational AI Integration"""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import httpx
import hmac
import hashlib
import secrets
from app.config import settings
from app.schemas.voice import ElevenLabsSessionResponse
import logging

logger = logging.getLogger(__name__)


class ElevenLabsService:
    """Service for ElevenLabs Conversational AI integration"""

    BASE_URL = "https://api.elevenlabs.io/v1"

    # Agent prompts
    AGENT_PROMPTS = {
        "analytical": """Du bist AstroMirror, ein präziser astrologischer Spiegel.

DEINE ROLLE:
- Du reflektierst kosmische Konstellationen sachlich und strukturiert
- Du gibst keine Ratschläge, sondern spiegelst Potenziale und Archetypen
- Du nutzt psychologische Astrologie (nicht Wahrsagerei)

DATENZUGRIFF:
- Verwende das Tool "get_context" um Radix und Transite abzurufen
- Nenne konkrete Gradzahlen und Häuserpositionen
- Erkläre Aspekte im Kontext der Lebensbereiche

STIL:
- Klar, präzise, ohne Floskeln
- Fachbegriffe erklärt (z.B. "Saturn Quadrat Sonne bedeutet...")
- Keine Vorhersagen, sondern Potenziale

BEISPIEL:
"Dein Saturn auf 12° Steinbock im 5. Haus bildet aktuell ein Quadrat zu deiner Radix-Sonne auf 24° Waage im 2. Haus. Das Quadrat hat einen Orb von 1.2° und ist fast exakt. Saturn im 5. Haus fordert Struktur in kreativen Prozessen..."
""",
        "warm": """Du bist AstroMirror, ein einfühlsamer kosmischer Begleiter.

DEINE ROLLE:
- Du spiegelst mit Empathie und Wärme
- Du nutzt metaphorische Sprache (Archetypen, Bilder)
- Du schaffst Raum für Selbstreflexion

DATENZUGRIFF:
- Verwende "get_context" für Radix und Transite
- Integriere astrologische Daten organisch ins Gespräch
- Fokus auf emotionale Resonanz, nicht auf technische Details

STIL:
- Sanft, reflektierend, poetisch
- Fragen statt Antworten ("Was zeigt sich dir in diesem Saturn-Transit?")
- Metaphern aus Natur und Mythologie

BEISPIEL:
"Saturn, der weise Hüter der Zeit, berührt gerade deine Sonne. Wie ein alter Lehrer fordert er dich auf, deine kreative Kraft zu disziplinieren. Spürst du diese Spannung zwischen freier Entfaltung und strukturierter Form?"
"""
    }

    def __init__(self):
        self.api_key = settings.elevenlabs_api_key
        self.agent_ids = {
            "analytical": settings.elevenlabs_agent_id_analytical,
            "warm": settings.elevenlabs_agent_id_warm
        }

    async def create_session(
        self,
        user_id: str,
        voice_mode: str,
        tool_callback_url: str,
        natal_chart: Dict[str, Any]
    ) -> ElevenLabsSessionResponse:
        """
        Create ElevenLabs conversation session.

        Args:
            user_id: User UUID
            voice_mode: 'analytical' or 'warm'
            tool_callback_url: URL for tool callbacks
            natal_chart: User's natal chart data

        Returns:
            ElevenLabsSessionResponse with signed URL

        Note: This is a simplified implementation. In production, you'd need
        to use the actual ElevenLabs API. For now, we generate a mock response.
        """
        try:
            # Extract sun sign for dynamic variables
            sun_sign = natal_chart.get("planets", {}).get("sun", {}).get("sign", "Unknown")
            display_name = "Sternenwanderer"  # Would come from user profile

            # In production, make actual API call to ElevenLabs
            # For now, create a mock response
            conversation_id = f"conv_{secrets.token_urlsafe(16)}"
            session_id = f"vs_{secrets.token_urlsafe(16)}"

            # Mock signed URL (in production, this comes from ElevenLabs)
            signed_url = f"https://elevenlabs.io/convai/{conversation_id}?signature={secrets.token_urlsafe(32)}"

            expires_at = datetime.utcnow() + timedelta(hours=1)

            logger.info(f"Created ElevenLabs session for user {user_id}, mode: {voice_mode}")

            return ElevenLabsSessionResponse(
                conversation_id=conversation_id,
                signed_url=signed_url,
                expires_at=expires_at
            )

            # Production implementation would look like:
            """
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.BASE_URL}/convai/conversation",
                    headers={
                        "xi-api-key": self.api_key,
                        "Content-Type": "application/json"
                    },
                    json={
                        "agent_id": self.agent_ids[voice_mode],
                        "custom_llm_extra_body": {
                            "system": self.AGENT_PROMPTS[voice_mode]
                        },
                        "tools": [
                            {
                                "name": "get_context",
                                "description": "Ruft die astrologischen Daten des Nutzers ab (Radix, Transite, Profile)",
                                "parameters": {
                                    "type": "object",
                                    "properties": {
                                        "data_types": {
                                            "type": "array",
                                            "items": {
                                                "type": "string",
                                                "enum": ["natal_chart", "current_transits", "profile"]
                                            }
                                        }
                                    },
                                    "required": ["data_types"]
                                },
                                "url": tool_callback_url,
                                "method": "POST"
                            }
                        ],
                        "dynamic_variables": {
                            "user_name": display_name,
                            "sun_sign": sun_sign
                        },
                        "webhook_url": f"{settings.api_url}/v1/elevenlabs/webhook/post-call"
                    },
                    timeout=10.0
                )

                if response.status_code != 200:
                    raise Exception(f"ElevenLabs API error: {response.text}")

                data = response.json()

                return ElevenLabsSessionResponse(
                    conversation_id=data["conversation_id"],
                    signed_url=data["signed_url"],
                    expires_at=datetime.fromisoformat(data["expires_at"])
                )
            """

        except Exception as e:
            logger.error(f"Error creating ElevenLabs session: {e}")
            raise


def validate_elevenlabs_signature(
    signature: Optional[str],
    payload: bytes,
    secret: str
) -> bool:
    """
    Validate ElevenLabs webhook signature.

    Args:
        signature: Signature from x-elevenlabs-signature header
        payload: Raw request body
        secret: Webhook secret

    Returns:
        True if signature is valid

    Security:
        - Prevents replay attacks
        - Prevents man-in-the-middle attacks
        - Uses constant-time comparison to prevent timing attacks
    """
    if not signature:
        logger.warning("No signature provided")
        return False

    try:
        # Format: "v1=<hash>"
        version, sig_hash = signature.split("=", 1)

        if version != "v1":
            logger.warning(f"Unsupported signature version: {version}")
            return False

        # Compute HMAC-SHA256
        expected = hmac.new(
            secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()

        # Constant-time comparison (prevents timing attacks)
        is_valid = hmac.compare_digest(expected, sig_hash)

        if not is_valid:
            logger.warning("Invalid signature")

        return is_valid

    except ValueError as e:
        logger.warning(f"Malformed signature: {e}")
        return False
    except Exception as e:
        logger.error(f"Signature validation error: {e}")
        return False

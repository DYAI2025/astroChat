# Voice Chat Backend Integrationsplan

## Executive Summary

Dieser Plan beschreibt die DSGVO-konforme Backend-Integration für den Voice Chat mit ElevenLabs. Das System ermöglicht authentifizierten Nutzern astrologische Beratungsgespräche, bei denen der AI-Agent sicheren Zugriff auf personalisierte Nutzerdaten (Geburtszeit, Planetenkonstellationen, etc.) erhält.

**Kernziele:**
- DSGVO-konforme Datenverarbeitung mit Consent-Tracking
- Sichere ElevenLabs Agent-Integration mit Tool-Callbacks
- Minimale Datenexposition (Data Minimization Principle)
- Audit-Trail für alle Datenzugriffe
- Zero-Trust Security Model

---

## 1. Architektur-Übersicht

```
┌─────────────────┐
│  Next.js        │
│  Frontend       │
│  (Port 3000)    │
└────────┬────────┘
         │ JWT Token
         ▼
┌─────────────────┐
│  FastAPI        │
│  Backend        │◄──────────┐
│  (Port 8000)    │           │
└────────┬────────┘           │
         │                    │
         ├──► Supabase DB     │
         │    (User Data)     │
         │                    │
         └──► ElevenLabs      │
              Conversational   │
              AI Platform      │
                              │
         ┌────────────────────┘
         │ Tool Callback
         │ (Signed Request)
         │
    ┌────▼─────────┐
    │ Tool         │
    │ Endpoint:    │
    │ /get_context │
    └──────────────┘
```

---

## 2. Datenfluss & Security Model

### 2.1 Session Creation Flow

```
1. User → Frontend: Klick "Gespräch starten"
2. Frontend → Backend: POST /v1/voice/session + JWT
3. Backend:
   a. JWT validieren (Supabase)
   b. Entitlements prüfen (Minuten verfügbar?)
   c. Birth Data Consent prüfen
   d. Natal Chart laden/berechnen
   e. ElevenLabs Session erstellen (mit Tool-URL)
4. Backend → ElevenLabs: API Request (Signed URL)
5. ElevenLabs → Backend: Signed Widget URL
6. Backend → Frontend: Session Response
7. Frontend: ElevenLabs Widget einbetten
```

### 2.2 Conversation Flow (Runtime)

```
1. User spricht: "Was bedeutet Saturn Quadrat Sonne?"
2. ElevenLabs Agent: Erkennt Bedarf für Kontext
3. ElevenLabs → Backend: Tool Call (get_context)
   - Signierter Request (ElevenLabs Signature)
   - Session ID
   - Conversation ID
4. Backend:
   a. Signature validieren
   b. Session validieren
   c. User ID aus Session holen
   d. Daten aus DB laden (birth_data, natal_charts)
   e. Astro-Berechnungen (Transite)
5. Backend → ElevenLabs: Context Payload (JSON)
6. ElevenLabs Agent: Antwort generieren mit Kontext
7. User hört Antwort
```

### 2.3 Post-Conversation Flow

```
1. Gespräch endet
2. ElevenLabs → Backend: Webhook POST /post-call
   - Conversation ID
   - Duration (Minuten)
   - Metadata
3. Backend:
   a. Usage updaten (entitlements.voice_minutes_used)
   b. Audit Log erstellen
   c. Session schließen
4. Backend → ElevenLabs: 200 OK
```

---

## 3. DSGVO-Konforme Implementierung

### 3.1 Rechtliche Grundlagen

| Aspekt | Implementierung | Rechtsgrundlage |
|--------|-----------------|-----------------|
| **Einwilligung** | Explizite Consent bei Geburtsdaten-Eingabe | Art. 6(1)(a) DSGVO |
| **Zweckbindung** | Daten nur für Astro-Berechnungen | Art. 5(1)(b) DSGVO |
| **Datenminimierung** | Nur essenzielle Daten an Agent | Art. 5(1)(c) DSGVO |
| **Speicherbegrenzung** | Voice Sessions: 90 Tage Retention | Art. 5(1)(e) DSGVO |
| **Integrität** | TLS 1.3, Signature Validation | Art. 5(1)(f) DSGVO |
| **Rechenschaftspflicht** | Audit Logs, Consent Versioning | Art. 5(2) DSGVO |

### 3.2 Consent Management

**Datenbank Schema (bereits vorhanden):**
```sql
-- birth_data table hat bereits:
consent_version TEXT NOT NULL  -- z.B. "v1.0.0"
consent_at TIMESTAMPTZ NOT NULL
```

**Erweiterung für Voice Features:**
```sql
-- Neue Tabelle: voice_consents
CREATE TABLE voice_consents (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,
  consent_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  consent_text TEXT NOT NULL,  -- Gespeicherte Consent-Formulierung
  withdrawn_at TIMESTAMPTZ,    -- NULL = aktiv
  CONSTRAINT chk_withdrawn CHECK (withdrawn_at IS NULL OR withdrawn_at > consent_at)
);
```

**Consent Check Logik:**
```python
async def check_voice_consent(user_id: str) -> bool:
    """
    Prüft ob User aktuelle Voice-Consent hat.
    DSGVO: Ohne Consent kein Voice-Zugriff.
    """
    consent = await db.voice_consents.find_one({
        "user_id": user_id,
        "withdrawn_at": None  # Nicht widerrufen
    })

    if not consent:
        raise ConsentRequiredException(
            "Bitte stimme der Nutzung deiner Geburtsdaten für Voice-Gespräche zu."
        )

    # Prüfe ob Consent-Version aktuell ist
    if consent["consent_version"] != CURRENT_CONSENT_VERSION:
        raise ConsentOutdatedException(
            "Bitte bestätige die aktualisierte Datenschutzerklärung."
        )

    return True
```

### 3.3 Data Minimization

**Prinzip:** Agent erhält nur die minimal notwendigen Daten.

**Beispiel Context Payload:**
```json
{
  "user_context": {
    "display_name": "Sternenwanderer",
    "locale": "de"
  },
  "natal_chart": {
    "sun": {"sign": "Zwillinge", "degree": 24.3, "house": 10},
    "moon": {"sign": "Fische", "degree": 12.1, "house": 7},
    "ascendant": {"sign": "Jungfrau", "degree": 5.8}
    // ... weitere Planeten
  },
  "current_transits": {
    "saturn_aspects": [
      {
        "type": "square",
        "planet": "sun",
        "orb": 1.2,
        "exact_date": "2025-01-15"
      }
    ]
  }
}
```

**NICHT enthalten:**
- ❌ Geburtsort (place_label) - nicht nötig für Gespräch
- ❌ Exakte Koordinaten (lat/lon) - nicht nötig
- ❌ Email-Adresse
- ❌ IP-Adressen
- ❌ Zahlungsdaten

### 3.4 Audit Trail

**Neue Tabelle:**
```sql
CREATE TABLE voice_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  conversation_id TEXT,
  event_type TEXT NOT NULL,  -- 'session_created', 'context_accessed', 'session_ended'
  data_accessed JSONB,        -- Welche Felder wurden abgerufen?
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  INDEX idx_voice_audit_user_id (user_id),
  INDEX idx_voice_audit_created_at (created_at DESC)
);

-- RLS Policy
CREATE POLICY "Users can view own audit logs" ON voice_audit_logs
  FOR SELECT USING (auth.uid() = user_id);
```

**Beispiel Log-Entry:**
```json
{
  "event_type": "context_accessed",
  "data_accessed": {
    "fields": ["natal_chart.sun", "natal_chart.moon", "current_transits"],
    "reason": "elevenlabs_tool_call"
  },
  "session_id": "vs_abc123",
  "conversation_id": "conv_xyz789"
}
```

### 3.5 Data Retention Policy

| Datentyp | Retention | Begründung |
|----------|-----------|------------|
| `voice_sessions` | 90 Tage | Audit-Zwecke, dann automatische Löschung |
| `voice_audit_logs` | 2 Jahre | Gesetzliche Anforderungen (DSGVO Art. 5(2)) |
| `natal_charts` | Unbegrenzt | Mit Consent, User kann löschen |
| `birth_data` | Unbegrenzt | Mit Consent, User kann löschen |

**Automatische Cleanup Funktion:**
```sql
-- Cron Job (täglich)
DELETE FROM voice_sessions WHERE created_at < now() - interval '90 days';
DELETE FROM voice_audit_logs WHERE created_at < now() - interval '2 years';
```

---

## 4. Backend API Implementation (FastAPI)

### 4.1 Projektstruktur

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Settings (Pydantic)
│   ├── dependencies.py         # Auth, DB connections
│   │
│   ├── models/
│   │   ├── user.py             # User, Profile models
│   │   ├── voice.py            # VoiceSession, VoiceUsage
│   │   └── astro.py            # NatalChart, Transit
│   │
│   ├── services/
│   │   ├── auth.py             # JWT validation (Supabase)
│   │   ├── voice.py            # ElevenLabs integration
│   │   ├── astro.py            # Swiss Ephemeris calculations
│   │   └── consent.py          # Consent management
│   │
│   ├── routers/
│   │   ├── voice.py            # /v1/voice/*
│   │   ├── elevenlabs.py       # /v1/elevenlabs/*
│   │   └── astro.py            # /v1/astro/*
│   │
│   └── schemas/
│       ├── voice.py            # Pydantic schemas
│       └── astro.py
│
├── tests/
├── requirements.txt
└── .env.example
```

### 4.2 Core Dependencies

```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-dotenv==1.0.0
pydantic==2.5.3
pydantic-settings==2.1.0

# Supabase & Auth
supabase==2.3.0
python-jose[cryptography]==3.3.0  # JWT validation
cryptography==41.0.7

# Database
asyncpg==0.29.0                   # PostgreSQL async driver
sqlalchemy[asyncio]==2.0.25

# ElevenLabs (keine offizielle Library - HTTP Client)
httpx==0.26.0                     # Async HTTP

# Astro Calculations
pyswisseph==2.10.3.2              # Swiss Ephemeris

# Utilities
python-multipart==0.0.6           # Form parsing
```

### 4.3 Environment Variables

```bash
# .env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...   # Service role (für Admin-Queries)
SUPABASE_JWT_SECRET=your-jwt-secret

# ElevenLabs
ELEVENLABS_API_KEY=sk_xxx
ELEVENLABS_AGENT_ID=agent_xxx     # Voice Agent ID
ELEVENLABS_WEBHOOK_SECRET=whsec_xxx

# App Config
API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development

# Security
TOOL_CALLBACK_SECRET=random-secret-min-32-chars
```

### 4.4 Key Endpoints

#### 4.4.1 POST /v1/voice/session

**Request:**
```json
{
  "voice_mode": "analytical"  // oder "warm"
}
```

**Response:**
```json
{
  "signed_url": "https://elevenlabs.io/convai/...",
  "signed_url_expires_at": "2025-01-24T15:30:00Z",
  "dynamic_variables": {
    "user_name": "Sternenwanderer",
    "sun_sign": "Zwillinge"
  },
  "limits": {
    "minutes_monthly_total": 60,
    "minutes_monthly_used": 12,
    "minutes_remaining": 48
  },
  "session_id": "vs_abc123"
}
```

**Implementation:**
```python
@router.post("/session", response_model=VoiceSessionResponse)
async def create_voice_session(
    request: VoiceSessionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Consent prüfen
    await consent_service.check_voice_consent(user.id, db)

    # 2. Entitlements prüfen
    entitlements = await db.get(Entitlements, user.id)
    if entitlements.plan == "free":
        raise HTTPException(402, "Premium required")

    remaining = entitlements.voice_minutes_monthly - entitlements.voice_minutes_used
    if remaining <= 0:
        raise HTTPException(429, "Monthly quota exceeded")

    # 3. Natal Chart laden
    natal_chart = await astro_service.get_natal_chart(user.id, db)
    if not natal_chart:
        raise HTTPException(404, "Bitte Geburtsdaten eingeben")

    # 4. ElevenLabs Session erstellen
    session = await elevenlabs_service.create_session(
        user_id=user.id,
        voice_mode=request.voice_mode,
        tool_callback_url=f"{settings.API_URL}/v1/elevenlabs/tool/get_context",
        natal_chart=natal_chart
    )

    # 5. Session in DB speichern
    voice_session = VoiceSession(
        id=session.session_id,
        user_id=user.id,
        elevenlabs_session_id=session.elevenlabs_id,
        status="active",
        voice_mode=request.voice_mode
    )
    db.add(voice_session)
    await db.commit()

    # 6. Audit Log
    await audit_log(
        user_id=user.id,
        event_type="session_created",
        session_id=session.session_id
    )

    return {
        "signed_url": session.signed_url,
        "signed_url_expires_at": session.expires_at,
        "dynamic_variables": {
            "user_name": user.display_name or "Sternenwanderer",
            "sun_sign": natal_chart.sun["sign"]
        },
        "limits": {
            "minutes_monthly_total": entitlements.voice_minutes_monthly,
            "minutes_monthly_used": entitlements.voice_minutes_used,
            "minutes_remaining": remaining
        },
        "session_id": session.session_id
    }
```

#### 4.4.2 POST /v1/elevenlabs/tool/get_context

**ElevenLabs Tool Configuration:**
```json
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
        },
        "description": "Welche Daten werden benötigt?"
      }
    },
    "required": ["data_types"]
  },
  "url": "https://api.astromirror.de/v1/elevenlabs/tool/get_context",
  "method": "POST"
}
```

**Request (von ElevenLabs):**
```json
{
  "session_id": "vs_abc123",
  "conversation_id": "conv_xyz789",
  "parameters": {
    "data_types": ["natal_chart", "current_transits"]
  }
}
```

**Response (an ElevenLabs):**
```json
{
  "user_context": {
    "display_name": "Sternenwanderer",
    "sun_sign": "Zwillinge"
  },
  "natal_chart": {
    "sun": {"sign": "Zwillinge", "degree": 24.3, "house": 10},
    "moon": {"sign": "Fische", "degree": 12.1, "house": 7},
    // ...
  },
  "current_transits": {
    "saturn_square_sun": {
      "orb": 1.2,
      "exact_date": "2025-01-15",
      "interpretation_key": "challenge_authority"
    }
  }
}
```

**Implementation:**
```python
@router.post("/tool/get_context")
async def get_context(
    request: Request,
    body: ToolCallRequest,
    db: AsyncSession = Depends(get_db)
):
    # 1. Validate ElevenLabs Signature
    signature = request.headers.get("x-elevenlabs-signature")
    if not validate_elevenlabs_signature(
        signature,
        await request.body(),
        settings.ELEVENLABS_WEBHOOK_SECRET
    ):
        raise HTTPException(401, "Invalid signature")

    # 2. Session validieren
    session = await db.get(VoiceSession, body.session_id)
    if not session or session.status != "active":
        raise HTTPException(404, "Invalid session")

    user_id = session.user_id

    # 3. Daten sammeln (nur angeforderte)
    response_data = {}

    if "profile" in body.parameters.data_types:
        profile = await db.get(Profile, user_id)
        response_data["user_context"] = {
            "display_name": profile.display_name,
            "locale": profile.locale
        }

    if "natal_chart" in body.parameters.data_types:
        natal_chart = await astro_service.get_natal_chart(user_id, db)
        response_data["natal_chart"] = natal_chart.to_agent_format()

    if "current_transits" in body.parameters.data_types:
        transits = await astro_service.calculate_transits(user_id, db)
        response_data["current_transits"] = transits.to_agent_format()

    # 4. Audit Log (DSGVO)
    await audit_log(
        user_id=user_id,
        event_type="context_accessed",
        session_id=body.session_id,
        data_accessed={
            "fields": body.parameters.data_types,
            "conversation_id": body.conversation_id
        }
    )

    return response_data
```

#### 4.4.3 POST /v1/elevenlabs/webhook/post-call

**Request (von ElevenLabs):**
```json
{
  "conversation_id": "conv_xyz789",
  "session_id": "vs_abc123",
  "duration_seconds": 420,
  "ended_at": "2025-01-24T14:30:00Z",
  "status": "completed"
}
```

**Implementation:**
```python
@router.post("/webhook/post-call")
async def post_call_webhook(
    request: Request,
    body: PostCallWebhook,
    db: AsyncSession = Depends(get_db)
):
    # 1. Signature validieren
    signature = request.headers.get("x-elevenlabs-signature")
    if not validate_elevenlabs_signature(signature, await request.body(), ...):
        raise HTTPException(401, "Invalid signature")

    # 2. Session holen
    session = await db.get(VoiceSession, body.session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    # 3. Usage berechnen
    minutes_used = ceil(body.duration_seconds / 60)

    # 4. Entitlements updaten
    entitlements = await db.get(Entitlements, session.user_id)
    entitlements.voice_minutes_used += minutes_used

    # 5. Session schließen
    session.status = "completed"
    session.ended_at = body.ended_at
    session.duration_seconds = body.duration_seconds

    await db.commit()

    # 6. Audit Log
    await audit_log(
        user_id=session.user_id,
        event_type="session_ended",
        session_id=body.session_id,
        data_accessed={"minutes_used": minutes_used}
    )

    return {"status": "ok"}
```

#### 4.4.4 GET /v1/voice/usage

**Response:**
```json
{
  "plan": "premium",
  "voice_minutes_monthly": 60,
  "voice_minutes_used": 12,
  "voice_minutes_remaining": 48,
  "period_start": "2025-01-01T00:00:00Z",
  "period_end": "2025-02-01T00:00:00Z",
  "recent_sessions": [
    {
      "id": "vs_abc123",
      "started_at": "2025-01-24T14:00:00Z",
      "duration_minutes": 7,
      "voice_mode": "analytical"
    }
  ]
}
```

---

## 5. ElevenLabs Integration Details

### 5.1 ElevenLabs API Endpoints

| Endpoint | Zweck | Dokumentation |
|----------|-------|---------------|
| `POST /v1/convai/conversation` | Session erstellen | [ElevenLabs Docs](https://elevenlabs.io/docs/api-reference/conversational-ai) |
| `GET /v1/convai/conversation/{id}` | Session-Status | - |
| Webhook: `POST /post-call` | Usage Tracking | - |
| Tool Callback | Custom Tools | - |

### 5.2 Session Creation Request

```python
async def create_session(
    user_id: str,
    voice_mode: str,
    tool_callback_url: str,
    natal_chart: NatalChart
):
    # Agent-Konfiguration basierend auf voice_mode
    agent_config = {
        "analytical": {
            "agent_id": settings.ELEVENLABS_AGENT_ANALYTICAL,
            "system_prompt": "Du bist ein präziser astrologischer Spiegel..."
        },
        "warm": {
            "agent_id": settings.ELEVENLABS_AGENT_WARM,
            "system_prompt": "Du bist ein einfühlsamer kosmischer Begleiter..."
        }
    }

    config = agent_config[voice_mode]

    # Request an ElevenLabs
    response = await httpx.post(
        "https://api.elevenlabs.io/v1/convai/conversation",
        headers={
            "xi-api-key": settings.ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "agent_id": config["agent_id"],
            "custom_llm_extra_body": {
                "system": config["system_prompt"]
            },
            "tools": [
                {
                    "name": "get_context",
                    "description": "Astrologische Daten des Nutzers abrufen",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "data_types": {
                                "type": "array",
                                "items": {"type": "string", "enum": ["natal_chart", "current_transits"]}
                            }
                        }
                    },
                    "url": tool_callback_url,
                    "method": "POST"
                }
            ],
            "dynamic_variables": {
                "user_name": natal_chart.user_name,
                "sun_sign": natal_chart.sun["sign"]
            },
            "webhook_url": f"{settings.API_URL}/v1/elevenlabs/webhook/post-call"
        },
        timeout=10.0
    )

    if response.status_code != 200:
        raise ElevenLabsAPIError(f"Failed to create session: {response.text}")

    data = response.json()

    return VoiceSessionElevenLabs(
        session_id=generate_session_id(),
        elevenlabs_id=data["conversation_id"],
        signed_url=data["signed_url"],
        expires_at=datetime.fromisoformat(data["expires_at"])
    )
```

### 5.3 Signature Validation

```python
import hmac
import hashlib

def validate_elevenlabs_signature(
    signature: str,
    payload: bytes,
    secret: str
) -> bool:
    """
    Validiert ElevenLabs Webhook Signature.
    Verhindert: Replay-Attacken, Man-in-the-Middle
    """
    if not signature:
        return False

    # Format: "v1=<hash>"
    try:
        version, sig_hash = signature.split("=")
        if version != "v1":
            return False
    except ValueError:
        return False

    # HMAC-SHA256 berechnen
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    # Constant-time comparison (verhindert Timing-Attacken)
    return hmac.compare_digest(expected, sig_hash)
```

---

## 6. Astro Service Implementation

### 6.1 Swiss Ephemeris Integration

```python
import swisseph as swe
from datetime import datetime, timezone

class AstroService:
    def __init__(self):
        # Swiss Ephemeris Datenfiles (optional)
        swe.set_ephe_path("/usr/share/swisseph")

    async def calculate_natal_chart(
        self,
        birth_utc: datetime,
        lat: float,
        lon: float
    ) -> dict:
        """
        Berechnet Radix mit Swiss Ephemeris.
        """
        # Julian Day berechnen
        jd = swe.julday(
            birth_utc.year,
            birth_utc.month,
            birth_utc.day,
            birth_utc.hour + birth_utc.minute / 60.0
        )

        # Planeten berechnen
        planets = {}
        for planet_id, planet_name in [
            (swe.SUN, "sun"),
            (swe.MOON, "moon"),
            (swe.MERCURY, "mercury"),
            # ... weitere Planeten
        ]:
            result, _ = swe.calc_ut(jd, planet_id)
            lon_deg = result[0]  # Ekliptikale Länge

            sign, degree = self._to_zodiac(lon_deg)

            planets[planet_name] = {
                "sign": sign,
                "degree": degree,
                "lon_absolute": lon_deg
            }

        # Häuser berechnen (Placidus)
        houses, ascmc = swe.houses(jd, lat, lon, b'P')  # P = Placidus

        asc_sign, asc_deg = self._to_zodiac(ascmc[0])
        mc_sign, mc_deg = self._to_zodiac(ascmc[1])

        return {
            "planets": planets,
            "ascendant": {"sign": asc_sign, "degree": asc_deg},
            "midheaven": {"sign": mc_sign, "degree": mc_deg},
            "houses": houses.tolist()
        }

    def _to_zodiac(self, lon: float) -> tuple[str, float]:
        """Konvertiert ekliptikale Länge zu Sternzeichen + Grad."""
        signs = [
            "Widder", "Stier", "Zwillinge", "Krebs",
            "Löwe", "Jungfrau", "Waage", "Skorpion",
            "Schütze", "Steinbock", "Wassermann", "Fische"
        ]
        sign_index = int(lon / 30)
        degree = lon % 30
        return signs[sign_index], degree

    async def calculate_transits(
        self,
        natal_chart: dict
    ) -> dict:
        """
        Berechnet aktuelle Transite zu Radix-Positionen.
        """
        # Aktuelles Datum
        now = datetime.now(timezone.utc)
        jd_now = swe.julday(now.year, now.month, now.day, now.hour + now.minute / 60.0)

        # Aktuelle Planetenpositionen
        transiting_planets = {}
        for planet_id, planet_name in [(swe.SUN, "sun"), (swe.SATURN, "saturn"), ...]:
            result, _ = swe.calc_ut(jd_now, planet_id)
            transiting_planets[planet_name] = result[0]

        # Aspekte finden (Orb: ±3°)
        aspects = []
        for transit_name, transit_lon in transiting_planets.items():
            for natal_name, natal_data in natal_chart["planets"].items():
                natal_lon = natal_data["lon_absolute"]

                # Konjunktion (0°)
                orb = abs((transit_lon - natal_lon + 180) % 360 - 180)
                if orb <= 3:
                    aspects.append({
                        "type": "conjunction",
                        "transit_planet": transit_name,
                        "natal_planet": natal_name,
                        "orb": orb
                    })

                # Quadrat (90°)
                orb_square = abs(orb - 90)
                if orb_square <= 3:
                    aspects.append({
                        "type": "square",
                        "transit_planet": transit_name,
                        "natal_planet": natal_name,
                        "orb": orb_square
                    })

                # Weitere Aspekte: Opposition (180°), Trigon (120°), Sextil (60°)
                # ...

        return {"aspects": aspects}
```

---

## 7. Security Checklist

- [ ] **JWT Validation**: Alle geschützten Endpoints validieren Supabase JWT
- [ ] **Signature Validation**: Tool Callbacks und Webhooks prüfen ElevenLabs Signature
- [ ] **Rate Limiting**: Pro User: max 10 Sessions/Tag (DoS-Schutz)
- [ ] **CORS**: Nur `FRONTEND_URL` erlaubt
- [ ] **TLS**: Nur HTTPS in Production (enforced)
- [ ] **SQL Injection**: Parametrisierte Queries (SQLAlchemy ORM)
- [ ] **XSS**: JSON-Responses (kein HTML)
- [ ] **Secrets**: Alle API Keys in Environment Variables
- [ ] **Logging**: Keine sensitiven Daten in Logs (birth_data, JWTs)
- [ ] **Timeouts**: Alle externe Requests mit Timeout (10s)

---

## 8. Testing Strategy

### 8.1 Unit Tests

```python
# tests/test_consent.py
async def test_consent_check_valid():
    user_id = "user_123"
    await create_consent(user_id, "v1.0.0")

    result = await check_voice_consent(user_id)
    assert result is True

async def test_consent_check_withdrawn():
    user_id = "user_456"
    await create_consent(user_id, "v1.0.0")
    await withdraw_consent(user_id)

    with pytest.raises(ConsentRequiredException):
        await check_voice_consent(user_id)
```

### 8.2 Integration Tests

```python
# tests/test_voice_session.py
async def test_create_session_success(client, auth_headers):
    response = await client.post(
        "/v1/voice/session",
        json={"voice_mode": "analytical"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "signed_url" in data
    assert "session_id" in data

async def test_create_session_no_consent(client, auth_headers_no_consent):
    response = await client.post(
        "/v1/voice/session",
        json={"voice_mode": "analytical"},
        headers=auth_headers_no_consent
    )
    assert response.status_code == 403
    assert "consent" in response.json()["message"].lower()
```

### 8.3 E2E Tests (Playwright)

```typescript
// tests/e2e/voice-chat.spec.ts
test('full voice session flow', async ({ page }) => {
  // Login
  await page.goto('/login')
  await login(page, 'premium@example.com')

  // Navigate to voice page
  await page.goto('/voice')

  // Select voice mode
  await page.click('[data-testid="voice-mode-analytical"]')

  // Start session
  await page.click('[data-testid="start-session-btn"]')

  // Wait for ElevenLabs widget
  await page.waitForSelector('elevenlabs-convai')

  // Verify minutes display
  const minutes = await page.textContent('[data-testid="minutes-remaining"]')
  expect(parseInt(minutes)).toBeGreaterThan(0)
})
```

---

## 9. Deployment Plan

### 9.1 Infrastructure

**Production Stack:**
- **Backend**: Railway / Render (FastAPI Docker Container)
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Vercel (Next.js)
- **Monitoring**: Sentry (Error Tracking)
- **Logs**: Better Stack (LogDNA)

### 9.2 Environment-Specific Config

| Variable | Development | Production |
|----------|-------------|------------|
| `API_URL` | `http://localhost:8000` | `https://api.astromirror.de` |
| `FRONTEND_URL` | `http://localhost:3000` | `https://app.astromirror.de` |
| `ELEVENLABS_WEBHOOK_SECRET` | `whsec_test123` | `whsec_prod_xxxxx` |
| `LOG_LEVEL` | `DEBUG` | `INFO` |

### 9.3 Deployment Steps

1. **Backend:**
   ```bash
   # Build Docker image
   docker build -t astromirror-backend .

   # Push to registry
   docker push registry.example.com/astromirror-backend:v1.0.0

   # Deploy to Railway
   railway up
   ```

2. **Database Migration:**
   ```bash
   # Run migrations in Supabase SQL Editor
   # 1. voice_consents table
   # 2. voice_audit_logs table
   # 3. voice_sessions table (if not exists)
   ```

3. **Frontend:**
   ```bash
   cd astromirror-webapp/apps/web
   vercel deploy --prod
   ```

4. **ElevenLabs Configuration:**
   - Agent erstellen (2x: analytical, warm)
   - Tool konfigurieren (get_context)
   - Webhook URL setzen

---

## 10. Monitoring & Observability

### 10.1 Metrics (Prometheus)

```python
from prometheus_client import Counter, Histogram

voice_sessions_created = Counter(
    'voice_sessions_created_total',
    'Total voice sessions created',
    ['voice_mode', 'plan']
)

voice_session_duration = Histogram(
    'voice_session_duration_seconds',
    'Voice session duration',
    buckets=[60, 180, 300, 600, 900, 1800]
)

tool_calls = Counter(
    'elevenlabs_tool_calls_total',
    'Total tool calls from ElevenLabs',
    ['tool_name', 'status']
)
```

### 10.2 Alerts

**Sentry Alerts:**
- [ ] `ConsentRequiredException` Rate > 5%
- [ ] ElevenLabs API Error Rate > 1%
- [ ] Average Response Time > 2s

**Database Alerts:**
- [ ] Voice usage table growing > 10GB/day (unexpected)
- [ ] Failed transactions > 0.1%

---

## 11. DSGVO Compliance Checklist

- [ ] **Informationspflicht (Art. 13)**: Datenschutzerklärung erweitert um Voice-Features
- [ ] **Einwilligung (Art. 6(1)(a))**: Explizite Consent-Form vor erster Session
- [ ] **Zweckbindung (Art. 5(1)(b))**: Daten nur für Astro-Gespräche
- [ ] **Datenminimierung (Art. 5(1)(c))**: Nur essenzielle Felder an Agent
- [ ] **Speicherbegrenzung (Art. 5(1)(e))**: 90-Tage Retention für Sessions
- [ ] **Auskunftsrecht (Art. 15)**: User kann Audit Logs einsehen
- [ ] **Löschrecht (Art. 17)**: User kann alle Voice-Daten löschen
- [ ] **Datenportabilität (Art. 20)**: Export aller Voice-Session Metadaten
- [ ] **Widerspruchsrecht (Art. 21)**: Consent jederzeit widerrufbar
- [ ] **Meldepflicht (Art. 33)**: Data Breach Response Plan
- [ ] **Auftragsverarbeitung (Art. 28)**: AVV mit ElevenLabs abgeschlossen

---

## 12. Nächste Schritte (Implementation Roadmap)

### Phase 1: Foundation (Woche 1-2)
1. FastAPI Projekt aufsetzen (Struktur, Dependencies)
2. Supabase Integration (Auth, DB Connection)
3. Database Migrations (voice_consents, voice_audit_logs)
4. JWT Validation Middleware

### Phase 2: Core Features (Woche 3-4)
5. Consent Service implementieren
6. Astro Service (Swiss Ephemeris)
7. Voice Session Endpoint (`POST /v1/voice/session`)
8. Usage Endpoint (`GET /v1/voice/usage`)

### Phase 3: ElevenLabs Integration (Woche 5)
9. ElevenLabs Client Service
10. Tool Callback Endpoint (`POST /v1/elevenlabs/tool/get_context`)
11. Webhook Endpoint (`POST /v1/elevenlabs/webhook/post-call`)
12. Signature Validation

### Phase 4: Security & Compliance (Woche 6)
13. Audit Logging
14. Rate Limiting
15. Security Headers (CORS, CSP)
16. DSGVO Documentation

### Phase 5: Testing & Deployment (Woche 7-8)
17. Unit Tests (>80% Coverage)
18. Integration Tests
19. E2E Tests
20. Production Deployment
21. Monitoring Setup

---

## Anhang A: Datenbank Schema (Komplett)

```sql
-- Voice Consents (NEU)
CREATE TABLE voice_consents (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,
  consent_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  consent_text TEXT NOT NULL,
  withdrawn_at TIMESTAMPTZ,
  CONSTRAINT chk_withdrawn CHECK (withdrawn_at IS NULL OR withdrawn_at > consent_at)
);

-- Voice Sessions (NEU)
CREATE TABLE voice_sessions (
  id TEXT PRIMARY KEY,  -- vs_abc123
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  elevenlabs_session_id TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  voice_mode TEXT NOT NULL CHECK (voice_mode IN ('analytical', 'warm')),
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  INDEX idx_voice_sessions_user_id (user_id),
  INDEX idx_voice_sessions_started_at (started_at DESC)
);

-- Voice Audit Logs (NEU)
CREATE TABLE voice_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT REFERENCES voice_sessions(id) ON DELETE SET NULL,
  conversation_id TEXT,
  event_type TEXT NOT NULL,
  data_accessed JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  INDEX idx_voice_audit_user_id (user_id),
  INDEX idx_voice_audit_created_at (created_at DESC)
);

-- RLS Policies
ALTER TABLE voice_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own consent" ON voice_consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consent" ON voice_consents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consent" ON voice_consents FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON voice_sessions FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE voice_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audit logs" ON voice_audit_logs FOR SELECT USING (auth.uid() = user_id);
```

---

## Anhang B: ElevenLabs Agent Prompt Templates

### Analytical Mode System Prompt
```
Du bist AstroMirror, ein präziser astrologischer Spiegel.

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

BEISPIEL-ANTWORT:
"Dein Saturn auf 12° Steinbock im 5. Haus bildet aktuell ein Quadrat zu deiner Radix-Sonne auf 24° Waage im 2. Haus. Das Quadrat hat einen Orb von 1.2° und ist fast exakt. Saturn im 5. Haus fordert Struktur in kreativen Prozessen..."
```

### Warm Mode System Prompt
```
Du bist AstroMirror, ein einfühlsamer kosmischer Begleiter.

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

BEISPIEL-ANTWORT:
"Saturn, der weise Hüter der Zeit, berührt gerade deine Sonne. Wie ein alter Lehrer fordert er dich auf, deine kreative Kraft zu disziplinieren. Spürst du diese Spannung zwischen freier Entfaltung und strukturierter Form?"
```

---

**Planerstellt am:** 2025-01-24
**Version:** 1.0.0
**Autor:** Claude (Anthropic)
**Review:** Pending

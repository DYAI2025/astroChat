# AstroMirror Voice Chat Backend

DSGVO-compliant FastAPI backend for voice chat with ElevenLabs integration.

## Features

- ✅ JWT authentication with Supabase
- ✅ DSGVO-compliant consent management
- ✅ Audit logging (Art. 5(2) DSGVO)
- ✅ Swiss Ephemeris astrology calculations
- ✅ ElevenLabs Conversational AI integration
- ✅ Rate limiting and security headers
- ✅ Comprehensive test suite

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Run Database Migration

Execute `migrations/002_voice_chat_schema.sql` in your Supabase SQL Editor.

### 4. Run Development Server

```bash
uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000`

Documentation: `http://localhost:8000/docs`

## Testing

Run all tests:

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=app --cov-report=html
```

## Docker

Build and run:

```bash
docker build -t astromirror-backend .
docker run -p 8000:8000 --env-file .env astromirror-backend
```

## API Endpoints

### Voice Chat
- `POST /v1/voice/session` - Create voice session
- `GET /v1/voice/usage` - Get usage statistics

### ElevenLabs Integration
- `POST /v1/elevenlabs/tool/get_context` - Tool callback (internal)
- `POST /v1/elevenlabs/webhook/post-call` - Post-call webhook (internal)

### Health
- `GET /health` - Health check

## Architecture

```
FastAPI Backend
├── app/
│   ├── main.py              # Application entry point
│   ├── config.py            # Settings management
│   ├── dependencies.py      # JWT auth, DB connections
│   ├── models/              # Pydantic models
│   ├── schemas/             # Request/Response schemas
│   ├── services/            # Business logic
│   │   ├── consent.py       # DSGVO consent management
│   │   ├── astro.py         # Swiss Ephemeris calculations
│   │   ├── elevenlabs.py    # ElevenLabs integration
│   │   └── audit.py         # Audit logging
│   └── routers/             # API routes
│       ├── voice.py         # Voice chat endpoints
│       └── elevenlabs.py    # ElevenLabs callbacks
├── tests/                   # Test suite
└── migrations/              # Database migrations
```

## Security

- JWT validation on all protected endpoints
- Signature validation for ElevenLabs webhooks
- Rate limiting (10 requests/minute per IP)
- CORS restricted to frontend URL
- Security headers (CSP, X-Frame-Options, etc.)
- Audit logging for all data access

## DSGVO Compliance

- ✅ Consent tracking with versioning
- ✅ Data minimization (only essential data sent to agent)
- ✅ Audit trail (2-year retention)
- ✅ Automatic data cleanup (90-day retention for sessions)
- ✅ User rights (access, deletion, portability)

See `VOICE_CHAT_BACKEND_PLAN.md` for full documentation.

## License

Proprietary - AstroMirror

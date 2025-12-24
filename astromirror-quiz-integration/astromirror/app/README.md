# AstroMirror

**Dein kosmischer Spiegel** – Premium-Astrologie mit Voice-Agent

## Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    Next.js 14 (Vercel)                          │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│    │   Voice UI   │  │   Quiz UI    │  │   Chart UI   │        │
│    │  ElevenLabs  │  │  Archetype   │  │    Radix     │        │
│    │    Widget    │  │              │  │              │        │
│    └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
│                  FastAPI (Railway/Fly.io)                       │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│    │ Voice Router │  │ Astro Router │  │ Quiz Router  │        │
│    │  /v1/voice   │  │  /v1/astro   │  │  /v1/quiz    │        │
│    └──────────────┘  └──────────────┘  └──────────────┘        │
│                              │                                  │
│    ┌──────────────────────────────────────────────────┐        │
│    │                   SERVICES                        │        │
│    │  ┌────────────┐  ┌────────────┐  ┌────────────┐  │        │
│    │  │   Astro    │  │   Voice    │  │    Quiz    │  │        │
│    │  │ Calculator │  │  Session   │  │   Engine   │  │        │
│    │  │(SwissEphe) │  │ (11Labs)   │  │            │  │        │
│    │  └────────────┘  └────────────┘  └────────────┘  │        │
│    └──────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                 │
│                   Supabase (PostgreSQL)                         │
│                                                                 │
│    profiles │ birth_data │ entitlements │ natal_charts          │
│    voice_sessions │ voice_conversations │ quiz_sessions         │
│                                                                 │
│    RLS Policies: User isolation │ Service Role bypass           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ELEVENLABS AGENT                             │
│                                                                 │
│    ┌──────────────────────────────────────────────────┐        │
│    │              Conversational AI                    │        │
│    │  System Prompt: "Kosmischer Spiegel"             │        │
│    │  Tool: get_context (POST → /v1/elevenlabs/tool)  │        │
│    │  Webhook: post-call → Usage Tracking             │        │
│    └──────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase account
- ElevenLabs account (Conversational AI access)

### 1. Clone & Install

```bash
cd astromirror

# Web dependencies
cd apps/web && npm install

# API dependencies
cd ../api && pip install -r requirements.txt
```

### 2. Environment Setup

```bash
# Web
cp apps/web/.env.example apps/web/.env.local

# API
cp apps/api/.env.example apps/api/.env
```

Fill in your credentials.

### 3. Database Migration

```bash
# Run Supabase migration
supabase db push
# Or manually execute: supabase/migrations/0001_init.sql
```

### 4. ElevenLabs Agent Setup

See `docs/ELEVENLABS_AGENT_SETUP.md` for detailed instructions.

### 5. Start Development

```bash
# Terminal 1: API
cd apps/api
uvicorn main:app --reload --port 8000

# Terminal 2: Web
cd apps/web
npm run dev
```

---

## Project Structure

```
/apps
  /api                    # FastAPI Backend
    /core
      config.py           # Settings & constants
      security.py         # JWT, HMAC, rate limiting
    /routers
      astro_router.py     # /v1/astro/*
      voice_router.py     # /v1/voice/*, /v1/elevenlabs/*
      quiz_router.py      # /v1/quiz/*
    /services
      astro_service.py    # Swiss Ephemeris calculations
      voice_service.py    # ElevenLabs integration
    main.py               # FastAPI app
    
  /web                    # Next.js Frontend
    /app
      /(app)
        /voice            # Voice Agent UI
        /dashboard        # User dashboard
        /chart            # Chart display
      /api                # API routes (proxy)
      /quiz               # Quiz UI
      layout.tsx          # Root layout (ElevenLabs script)
      globals.css         # Design system
    middleware.ts         # Auth protection
    
/supabase
  /migrations
    0001_init.sql         # Schema + RLS

/docs
  ELEVENLABS_AGENT_SETUP.md
```

---

## Key Features

### Voice Agent (Premium)

- Real-time conversation with ElevenLabs AI
- Radix + Transit context via tool calls
- Two voice modes: Analytical / Warm
- Monthly minute limits with tracking

### Astro Calculations

- Swiss Ephemeris for precision
- Placidus houses with polar fallback
- Tropical zodiac
- Full aspect detection

### Cosmic Archetype Quiz

- 7 questions, 8 profiles
- 3D scoring: Element × Modality × Orientation
- No login required
- Bridge to Premium conversion

---

## API Endpoints

### Astro

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/astro/compute-natal` | JWT | Compute/recompute natal chart |
| GET | `/v1/astro/natal` | JWT | Get cached chart |
| GET | `/v1/astro/daily` | JWT | Get daily insight |

### Voice

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/voice/session` | JWT + Premium | Create voice session |
| GET | `/v1/voice/usage` | JWT | Get usage stats |
| GET | `/v1/voice/conversations` | JWT | Get history |

### ElevenLabs (Internal)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/elevenlabs/tool/get_context` | Session Token | Agent tool endpoint |
| POST | `/v1/elevenlabs/webhook/post-call` | HMAC | Post-call webhook |

### Quiz

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/quiz/start` | Optional | Start quiz session |
| POST | `/v1/quiz/answer` | Optional | Submit answer |
| GET | `/v1/quiz/result/:id` | Optional | Get result |

---

## Security

- **RLS**: All user data isolated
- **JWT**: Supabase HS256 tokens
- **Session Tokens**: SHA256 + pepper for tool auth
- **HMAC**: Webhook signature verification
- **Rate Limiting**: 60 req/min (configurable)

---

## Deployment

### Web (Vercel)

```bash
vercel --prod
```

Environment variables in Vercel dashboard.

### API (Railway)

```bash
railway up
```

Or use Dockerfile:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Database (Supabase)

1. Create project at supabase.com
2. Run migration from SQL editor
3. Enable RLS (automatic from migration)

---

## Design Tokens

```css
--bg-obsidian: #070708
--bg-graphite: #0F1012
--gold-primary: #D4AF37
--gold-muted: #B8975E
--emerald-deep: #0F3D2E
--text-ivory: #F6F0E1
--text-mist: #CFC7B8
```

**Typography**: Cinzel (display) + Inter (body)

---

## License

Proprietary. All rights reserved.

---

## Contact

Questions? See `docs/` or open an issue.

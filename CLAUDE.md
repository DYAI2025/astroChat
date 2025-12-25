# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains two Next.js 14 applications for the AstroMirror platform:

1. **astromirror-quiz-integration** - Standalone cosmic archetype quiz (German UI)
2. **astromirror-webapp** - Full premium astrology platform with voice agent integration

## Commands

### Quiz Application
```bash
cd astromirror-quiz-integration/astromirror

npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking (tsc --noEmit)
```

### Main Web Application
```bash
cd astromirror-webapp/apps/web

npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Architecture

### Quiz Application (`astromirror-quiz-integration/astromirror/`)

**Core Flow**: Simple stateless quiz with session-based scoring

1. **Frontend** (`components/CosmicArchetypeQuiz.tsx`): Framer Motion animated quiz component with state machine (loading → intro → question → processing → result)

2. **API Routes** (`app/api/quiz/`):
   - `start/route.ts`: Creates session, returns first question
   - `answer/route.ts`: Validates answer, updates session, returns next question or result URL
   - `result/[sessionId]/route.ts`: Returns calculated profile and scores

3. **Quiz Engine** (`lib/quiz-engine.ts`): Stateless scoring logic
   - `applyAnswerScoring()`: Accumulates scores from answers
   - `determineProfile()`: Matches score state to archetype profile using weighted criteria

4. **Session Store** (`lib/session-store.ts`): In-memory Map-based storage (24h TTL). Production should use Supabase.

5. **Quiz Data** (`lib/quiz-data.ts`): Loads from `public/data/cosmic-archetype-quiz.json` (override with `QUIZ_DATA_PATH` env var)

**Scoring System**: 9-dimensional scoring across elements (fire/water/air/earth), modalities (cardinal/fixed/mutable), and orientations (solar/lunar). Profiles matched via weighted criteria hierarchy. Falls back to "Kosmischer Hybrid" if no profile meets minimum 2 criteria.

**Path Aliases**: `@/*` maps to app root (tsconfig.json). Use `@/lib/`, `@/types/`, `@/components/` for imports.

### Main Web Application (`astromirror-webapp/apps/web/`)

**Core Flow**: Full-stack astrology platform with FastAPI backend

```
Frontend (Next.js) → API Routes (Proxy) → FastAPI Backend → Supabase
                                        ↓
                                   ElevenLabs Agent
```

**Key Directories**:

- `app/(app)/` - Protected routes (dashboard, voice, chart, settings)
- `app/(auth)/` - Auth routes (login, signup)
- `app/(marketing)/` - Public routes (pricing, landing)
- `app/api/` - API proxy routes that forward to FastAPI backend
- `app/quiz/` - Cosmic archetype quiz pages
- `middleware.ts` - Auth protection for `/dashboard`, `/chart`, `/voice`, `/settings`
- `lib/supabase.ts` - Supabase client utilities and database types

**Route Groups**:
- `(app)` - Requires authentication
- `(auth)` - Login/signup flows
- `(marketing)` - Public marketing pages

**Backend Integration**: All API routes proxy to FastAPI backend (default: `http://localhost:8000`). Backend handles:
- Astro calculations (Swiss Ephemeris) - `/v1/astro/*`
- Voice agent sessions (ElevenLabs) - `/v1/voice/*`
- Quiz logic - `/v1/quiz/*`

**Authentication**:
- Supabase JWT tokens stored in cookies (`sb-access-token`, `sb-refresh-token`)
- Middleware validates tokens and redirects to `/login` with `?redirect=` param
- Protected routes require valid JWT

**Database Schema** (via `lib/supabase.ts`):
- `profiles` - User profiles with locale/timezone
- `birth_data` - Birth time/location with consent tracking
- `entitlements` - Plan management (free/premium) with voice minute quotas
- `natal_charts` - Cached Swiss Ephemeris calculations
- `quiz_sessions` - Quiz state with answers/scores/profile_id

**Voice Agent**: ElevenLabs Conversational AI integration
- Tool endpoint: `/v1/elevenlabs/tool/get_context` (provides radix + transit data)
- Webhook: `/v1/elevenlabs/webhook/post-call` (tracks usage)
- Session creation via `/api/voice/session` (proxies to FastAPI)

## Environment Variables

### Quiz App
```bash
# Required for persistence
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
QUIZ_DATA_PATH=  # Optional: Override quiz JSON path
```

### Main App
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend API (development)
API_URL=http://localhost:8000
```

## Initial Setup

### 1. Install Dependencies
```bash
# Quiz App
cd astromirror-quiz-integration/astromirror
npm install

# Main App
cd astromirror-webapp/apps/web
npm install
```

### 2. Configure Environment
Create `.env.local` files in both app directories with Supabase credentials from your project dashboard.

### 3. Database Setup (Required)

**Enable Anonymous Auth** (for quiz app):
- Supabase Dashboard → Authentication → Providers → Anonymous → Enable

**Run Migration**:
- Navigate to SQL Editor in Supabase Dashboard
- Execute `astromirror-quiz-integration/astromirror/supabase/migrations/001_initial_schema.sql`
- This creates: `profiles`, `quiz_sessions`, `quiz_results` tables with RLS policies

### 4. Run Development Servers

Run both apps in parallel on different ports:
```bash
# Terminal 1: Main app (port 3000)
cd astromirror-webapp/apps/web
npm run dev

# Terminal 2: Quiz app (port 3001)
cd astromirror-quiz-integration/astromirror
PORT=3001 npm run dev
```

## Design System

Both apps use Tailwind CSS with custom AstroMirror design tokens:

**Colors**:
- Backgrounds: `obsidian` (#070708), `graphite` (#0F1012)
- Accents: `gold` (#D4AF37), `gold-muted` (#B8975E)
- Emerald: `emerald-deep` (#0F3D2E)
- Text: `ivory` (#F6F0E1), `mist` (#CFC7B8)

**Typography**:
- Display: Cinzel (font-display)
- Body: Inter

**Utility Classes**:
- `btn-primary` - Gold CTA button
- `btn-ghost` - Outlined button
- `card` - Standard card container
- `text-gradient-gold` - Gold gradient text effect

## Type System

### Quiz App
- `types/quiz.ts` - Quiz structure (Question, Answer, Profile, ScoreState)
- `types/database.ts` - Database row types (DbQuizSession, DbQuizResult)

### Main App
- `lib/supabase.ts` - Contains Database type with all table schemas
- Type-safe Supabase client with Row/Insert/Update types

## Development Notes

**Quiz App**:
- Designed for anonymous users (no login required)
- Sessions expire after 24h
- Production should migrate to Supabase for persistence
- German language UI throughout

**Main App**:
- Requires FastAPI backend running on port 8000 for full functionality
- Backend not included in this repository
- Middleware protects authenticated routes
- Quiz data loaded from `data/cosmic-archetype-quiz.json` (same format as quiz app)
- Voice features require ElevenLabs API credentials in backend

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript type checking
```

## Architecture Overview

AstroMirror is a Next.js 14 personality quiz app that determines a user's "cosmic archetype" based on astrological elements. German UI.

### Core Flow

1. **Quiz Start** → API creates session → stores in Supabase → returns first question
2. **Answer Loop** → User answers → API updates session → returns next question or completion
3. **Result** → Scoring engine calculates archetype → persists result → displays profile

### Key Directories

- `app/api/quiz/` - REST endpoints: `/start`, `/answer`, `/result/[sessionId]`
- `lib/` - Business logic: quiz-engine (scoring), session-store (Supabase), quiz-data (JSON loader)
- `components/` - Main quiz UI: `CosmicArchetypeQuiz.tsx` (Framer Motion animated)
- `types/` - TypeScript definitions for quiz data, sessions, and database models

### Scoring System

9-dimensional scoring across three categories:
- **Elements**: fire, water, air, earth
- **Modalities**: cardinal, fixed, mutable
- **Orientations**: solar, lunar

Each answer adds points to multiple dimensions. Final profile determined by highest scores with weighted criteria matching. Fallback profile ("Kosmischer Hybrid") used when no profile matches.

Profile ID pattern: `{orientation}_{modality}_{element}` (e.g., `solar_cardinal_fire`)

### Data Layer

- Quiz content (questions, profiles, answers) loaded from JSON via `lib/quiz-data.ts`
- Sessions/results persisted to Supabase with anonymous authentication (no login required)
- Database schema in `supabase/migrations/001_initial_schema.sql`
- RLS policies ensure users only access own data

### Supabase Setup Requirements

1. Enable "Anonymous Sign-Ins" in Dashboard: Authentication > Providers > Anonymous
2. Run migration SQL in SQL Editor

### Type System

- `types/quiz.ts` - Quiz structure types (Question, Answer, Profile, ScoreState)
- `types/database.ts` - Database row types (DbQuizSession, DbQuizResult)

### Design System

Custom Tailwind config with AstroMirror tokens:
- Colors: obsidian (#070708), gold-primary (#D4AF37), emerald-deep (#0F3D2E), ivory (#F6F0E1)
- Animations: pulse-gold, fade-in (also Framer Motion variants in quiz component)

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

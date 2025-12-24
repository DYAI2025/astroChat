# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AstroMirror is a Next.js 14 personality quiz application ("Kosmischer Archetyp" - Cosmic Archetype Quiz). Users answer 7 questions to receive a personalized archetype profile based on astrological elements (fire/water/air/earth), modalities (cardinal/fixed/mutable), and orientations (solar/lunar).

## Commands

```bash
# First, change to the app directory
cd astromirror-quiz-integration/astromirror

npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking (tsc --noEmit)
```

## Architecture

The main application lives in `astromirror-quiz-integration/astromirror/`. Root-level `.ts`/`.tsx` files are reference copies.

### Core Flow

1. **Frontend** (`components/CosmicArchetypeQuiz.tsx`): React component with Framer Motion animations, manages quiz state machine (loading → intro → question → processing → result)

2. **API Routes** (`app/api/quiz/`):
   - `start/route.ts`: Creates session, returns first question
   - `answer/route.ts`: Validates answer, updates session, returns next question or result URL
   - `result/[sessionId]/route.ts`: Returns calculated profile and scores

3. **Quiz Engine** (`lib/quiz-engine.ts`): Stateless scoring logic
   - `applyAnswerScoring()`: Accumulates scores from answers
   - `determineProfile()`: Matches score state to archetype profile using weighted criteria

4. **Session Store** (`lib/session-store.ts`): In-memory Map-based storage (24h TTL). Production should use Supabase.

5. **Quiz Data** (`lib/quiz-data.ts`): Loads from `public/data/cosmic-archetype-quiz.json` (override with `QUIZ_DATA_PATH` env var)

### Path Aliases

The `@/*` alias maps to the app root (configured in tsconfig.json). Use `@/lib/`, `@/types/`, `@/components/` for imports.

### Type System

All types in `types/quiz.ts`. Key types:
- `ScoreState`: 9-dimensional score vector (4 elements + 3 modalities + 2 orientations)
- `Profile` / `FallbackProfile`: Archetype result with matching criteria
- `QuizSession`: Tracks answers as `Record<question_id, answer_id>`

### Scoring Algorithm

Profiles matched via weighted criteria hierarchy:
1. Primary criterion (weight 3)
2. Secondary criterion (weight 2)
3. Tertiary criterion (weight 1)
4. Element match bonus (+0.5)
5. Orientation as tiebreaker (+0.25)

Falls back to "Kosmischer Hybrid" if no profile meets minimum 2 criteria.

## UI/Styling

- Tailwind CSS + inline styles with design tokens
- Color palette: dark backgrounds (`#070708`, `#0F1012`), gold accents (`#D4AF37`), emerald CTAs (`#0F3D2E`)
- German language UI

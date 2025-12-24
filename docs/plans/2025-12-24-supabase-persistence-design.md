# Supabase Persistence Design

## Overview

Replace in-memory session storage with Supabase (PostgreSQL) persistence. Add user authentication via magic links and a profile page showing quiz history.

## Requirements

- Supabase for persistence (PostgreSQL)
- Store: Sessions, Results, User accounts
- Magic link (passwordless email) authentication
- Login required before starting quiz
- Profile page with list of past results (clickable to view full result)
- Quiz content (questions, profiles) stays in JSON file

## Database Schema

```sql
-- Users handled by Supabase Auth (auth.users)
-- App-specific profile data

profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
)

quiz_sessions (
  id            text PRIMARY KEY,  -- existing format: quiz_xxx_xxx
  user_id       uuid REFERENCES profiles(id) NOT NULL,
  started_at    timestamptz NOT NULL,
  completed_at  timestamptz,
  answers       jsonb NOT NULL DEFAULT '{}',  -- {question_id: answer_id}
  current_question int DEFAULT 0
)

quiz_results (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  text REFERENCES quiz_sessions(id) UNIQUE,
  user_id     uuid REFERENCES profiles(id) NOT NULL,
  profile_id  text NOT NULL,          -- archetype id from JSON
  scores      jsonb NOT NULL,          -- ScoreState object
  is_fallback boolean DEFAULT false,
  completed_at timestamptz NOT NULL,
  created_at  timestamptz DEFAULT now()
)
```

Row Level Security (RLS):
- `quiz_sessions`: SELECT/INSERT/UPDATE where `user_id = auth.uid()`
- `quiz_results`: SELECT/INSERT where `user_id = auth.uid()`

## Authentication Flow

**New pages:**
- `app/login/page.tsx` - Magic link request form
- `app/auth/callback/route.ts` - Handles magic link redirect
- `app/profile/page.tsx` - User's result history

**Flow:**
1. User visits quiz page
2. Middleware checks for Supabase session
3. No session → redirect to `/login`
4. User enters email, receives magic link
5. Click link → `/auth/callback` exchanges code for session
6. Redirect to quiz

**Supabase client setup:**
```
lib/supabase/
  client.ts     -- Browser client (createBrowserClient)
  server.ts     -- Server client for API routes (createServerClient)
  middleware.ts -- Session refresh logic
```

Using `@supabase/ssr` for Next.js 14 App Router compatibility.

**Middleware** (root `middleware.ts`):
- Refreshes session on each request
- Protects `/quiz/*` and `/profile` routes
- Allows `/login` and `/auth/callback` without auth

## Session Store Refactor

Replace in-memory Map with Supabase queries. Same interface:

```typescript
export async function saveSession(session: QuizSession): Promise<void> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('quiz_sessions').upsert({
    id: session.id,
    user_id: user!.id,
    started_at: session.started_at,
    answers: session.answers,
    current_question: session.current_question,
    completed_at: session.completed_at,
  });
}

export async function getSession(sessionId: string): Promise<QuizSession | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  return data ? mapToQuizSession(data) : null;
}
```

Remove TTL logic and `cleanupExpiredSessions()` - no longer needed.

## Profile & History Page

**`app/profile/page.tsx`** - Server component:
- Fetches user's results ordered by date
- Shows list with archetype name, date, view button
- Links to `/profile/result/[id]`

**`app/profile/result/[id]/page.tsx`**:
- Fetches single result
- Loads profile from JSON using stored `profile_id`
- Reuses result display component

**Navigation:**
- "Meine Ergebnisse" link in header after login
- "Verlauf anzeigen" button on result screen

## Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Implementation Order

1. Supabase setup - Create project, run SQL migrations
2. Client libraries - `lib/supabase/client.ts`, `server.ts`, `middleware.ts`
3. Auth pages - `/login`, `/auth/callback`
4. Middleware - Protect routes, refresh sessions
5. Refactor session-store.ts - Replace Map with Supabase
6. Extract result component - Make reusable
7. Profile page - `/profile` with results list
8. Result detail page - `/profile/result/[id]`
9. Navigation updates - Add profile links

## Unchanged

- `quiz-engine.ts` (pure scoring logic)
- `quiz-data.ts` (JSON loading)
- `types/quiz.ts` (types remain the same)
- API route logic (calls same store functions)

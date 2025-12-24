# Supabase Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace in-memory session storage with Supabase persistence, add magic link authentication, and create a user profile page with quiz history.

**Architecture:** Next.js 14 App Router with Supabase for auth and PostgreSQL storage. Server components for data fetching, client components for interactivity. RLS policies ensure users only access their own data.

**Tech Stack:** Next.js 14, Supabase (Auth + PostgreSQL), @supabase/ssr, TypeScript, Tailwind CSS

---

## Task 1: Install Dependencies

**Files:**
- Modify: `astromirror-quiz-integration/astromirror/package.json`

**Step 1: Install Supabase packages**

Run from `astromirror-quiz-integration/astromirror/`:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Step 2: Create environment file**

Create: `astromirror-quiz-integration/astromirror/.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Step 3: Commit**

```bash
git add package.json package-lock.json .env.local
git commit -m "feat: add Supabase dependencies"
```

---

## Task 2: Create Database Schema

**Files:**
- Create: `astromirror-quiz-integration/astromirror/supabase/migrations/001_initial_schema.sql`

**Step 1: Create migration file**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Quiz sessions table
CREATE TABLE quiz_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  answers JSONB NOT NULL DEFAULT '{}',
  current_question INT DEFAULT 0
);

-- Quiz results table
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES quiz_sessions(id) ON DELETE CASCADE UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  profile_id TEXT NOT NULL,
  scores JSONB NOT NULL,
  is_fallback BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Quiz sessions policies
CREATE POLICY "Users can view own sessions"
  ON quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON quiz_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Quiz results policies
CREATE POLICY "Users can view own results"
  ON quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_completed_at ON quiz_results(completed_at DESC);
```

**Step 2: Run migration in Supabase Dashboard**

Go to Supabase Dashboard → SQL Editor → Paste and run the migration.

**Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase database schema and RLS policies"
```

---

## Task 3: Create Supabase Client Utilities

**Files:**
- Create: `astromirror-quiz-integration/astromirror/lib/supabase/client.ts`
- Create: `astromirror-quiz-integration/astromirror/lib/supabase/server.ts`

**Step 1: Create browser client**

Create: `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 2: Create server client**

Create: `lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  );
}
```

**Step 3: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase client utilities for browser and server"
```

---

## Task 4: Create Auth Middleware

**Files:**
- Create: `astromirror-quiz-integration/astromirror/lib/supabase/middleware.ts`
- Create: `astromirror-quiz-integration/astromirror/middleware.ts`

**Step 1: Create middleware utility**

Create: `lib/supabase/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const protectedPaths = ['/quiz', '/profile'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login
  if (request.nextUrl.pathname === '/login' && user) {
    const redirect = request.nextUrl.searchParams.get('redirect') || '/quiz/cosmic-archetype';
    const url = request.nextUrl.clone();
    url.pathname = redirect;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

**Step 2: Create root middleware**

Create: `middleware.ts` (in astromirror root, same level as app/)

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Step 3: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add lib/supabase/middleware.ts middleware.ts
git commit -m "feat: add auth middleware for route protection"
```

---

## Task 5: Create Login Page

**Files:**
- Create: `astromirror-quiz-integration/astromirror/app/login/page.tsx`

**Step 1: Create login page**

Create: `app/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
    } else {
      setStatus('sent');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4" style={{ color: 'var(--gold-primary)' }}>✧</div>
          <h1 className="text-2xl font-light mb-2" style={{ color: 'var(--text-ivory)' }}>
            AstroMirror
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-mist)' }}>
            Melde dich an, um dein kosmisches Profil zu entdecken
          </p>
        </div>

        {status === 'sent' ? (
          <div className="surface p-8 text-center">
            <div className="text-2xl mb-4">✉️</div>
            <h2 className="text-lg mb-2" style={{ color: 'var(--gold-primary)' }}>
              Prüfe dein Postfach
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-mist)' }}>
              Wir haben dir einen magischen Link an <strong>{email}</strong> gesendet.
              Klicke darauf, um dich anzumelden.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="surface p-8">
            <label className="block mb-6">
              <span className="text-sm mb-2 block" style={{ color: 'var(--text-mist)' }}>
                E-Mail-Adresse
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="deine@email.de"
                className="w-full px-4 py-3 bg-transparent border rounded"
                style={{
                  borderColor: 'var(--gold-muted)',
                  color: 'var(--text-ivory)',
                }}
              />
            </label>

            {status === 'error' && (
              <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-luxury w-full"
              style={{ opacity: status === 'loading' ? 0.7 : 1 }}
            >
              {status === 'loading' ? 'WIRD GESENDET...' : 'MAGISCHEN LINK SENDEN'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No errors

**Step 3: Commit**

```bash
git add app/login/
git commit -m "feat: add magic link login page"
```

---

## Task 6: Create Auth Callback Route

**Files:**
- Create: `astromirror-quiz-integration/astromirror/app/auth/callback/route.ts`

**Step 1: Create callback route**

Create: `app/auth/callback/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/quiz/cosmic-archetype';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No errors

**Step 3: Commit**

```bash
git add app/auth/
git commit -m "feat: add auth callback route for magic link"
```

---

## Task 7: Add Database Types

**Files:**
- Create: `astromirror-quiz-integration/astromirror/types/database.ts`

**Step 1: Create database types**

Create: `types/database.ts`

```typescript
export interface DbQuizSession {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  answers: Record<string, string>;
  current_question: number;
}

export interface DbQuizResult {
  id: string;
  session_id: string;
  user_id: string;
  profile_id: string;
  scores: {
    fire: number;
    water: number;
    air: number;
    earth: number;
    cardinal: number;
    fixed: number;
    mutable: number;
    solar: number;
    lunar: number;
  };
  is_fallback: boolean;
  completed_at: string;
  created_at: string;
}

export interface DbProfile {
  id: string;
  created_at: string;
  updated_at: string;
}
```

**Step 2: Commit**

```bash
git add types/database.ts
git commit -m "feat: add database type definitions"
```

---

## Task 8: Refactor Session Store

**Files:**
- Modify: `astromirror-quiz-integration/astromirror/lib/session-store.ts`

**Step 1: Replace entire session-store.ts**

```typescript
// AstroMirror Quiz Session Store
// Supabase implementation

import { createClient } from '@/lib/supabase/server';
import type { QuizSession, QuizResult, ScoreState } from '@/types/quiz';
import type { DbQuizSession, DbQuizResult } from '@/types/database';

function mapDbToSession(db: DbQuizSession): QuizSession {
  return {
    id: db.id,
    started_at: db.started_at,
    answers: db.answers,
    current_question: db.current_question,
    completed_at: db.completed_at ?? undefined,
    profile_id: undefined, // Loaded separately from results
  };
}

/**
 * Save a quiz session
 */
export async function saveSession(session: QuizSession): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('quiz_sessions').upsert({
    id: session.id,
    user_id: user.id,
    started_at: session.started_at,
    answers: session.answers,
    current_question: session.current_question,
    completed_at: session.completed_at ?? null,
  });

  if (error) throw new Error(`Failed to save session: ${error.message}`);
}

/**
 * Get a quiz session by ID
 */
export async function getSession(sessionId: string): Promise<QuizSession | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !data) return null;

  return mapDbToSession(data as DbQuizSession);
}

/**
 * Update session with new answer
 */
export async function updateSessionAnswer(
  sessionId: string,
  questionId: string,
  answerId: string
): Promise<QuizSession | null> {
  const session = await getSession(sessionId);
  if (!session) return null;

  session.answers[questionId] = answerId;
  session.current_question = Object.keys(session.answers).length;

  await saveSession(session);
  return session;
}

/**
 * Mark session as completed
 */
export async function completeSession(
  sessionId: string,
  profileId: string
): Promise<QuizSession | null> {
  const session = await getSession(sessionId);
  if (!session) return null;

  session.completed_at = new Date().toISOString();
  session.profile_id = profileId;

  await saveSession(session);
  return session;
}

/**
 * Save quiz result
 */
export async function saveResult(result: QuizResult): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('quiz_results').insert({
    session_id: result.session_id,
    user_id: user.id,
    profile_id: result.profile.id,
    scores: result.scores,
    is_fallback: result.is_fallback,
    completed_at: result.completed_at,
  });

  if (error) throw new Error(`Failed to save result: ${error.message}`);
}

/**
 * Get quiz result by session ID
 */
export async function getResult(sessionId: string): Promise<QuizResult | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error || !data) return null;

  const dbResult = data as DbQuizResult;

  // Note: profile object must be loaded from quiz data JSON separately
  // Return partial result with profile_id for caller to resolve
  return {
    session_id: dbResult.session_id,
    profile: { id: dbResult.profile_id } as any, // Caller resolves full profile
    scores: dbResult.scores as ScoreState,
    completed_at: dbResult.completed_at,
    is_fallback: dbResult.is_fallback,
  };
}

/**
 * Get all results for current user
 */
export async function getUserResults(): Promise<DbQuizResult[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .order('completed_at', { ascending: false });

  if (error) return [];

  return data as DbQuizResult[];
}

/**
 * Get single result by ID
 */
export async function getResultById(resultId: string): Promise<DbQuizResult | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('id', resultId)
    .single();

  if (error || !data) return null;

  return data as DbQuizResult;
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No errors

**Step 3: Commit**

```bash
git add lib/session-store.ts
git commit -m "feat: refactor session store to use Supabase"
```

---

## Task 9: Create Profile Page

**Files:**
- Create: `astromirror-quiz-integration/astromirror/app/profile/page.tsx`
- Create: `astromirror-quiz-integration/astromirror/components/ResultCard.tsx`

**Step 1: Create ResultCard component**

Create: `components/ResultCard.tsx`

```typescript
import Link from 'next/link';
import type { DbQuizResult } from '@/types/database';

interface ResultCardProps {
  result: DbQuizResult;
  archetypeName: string;
}

export default function ResultCard({ result, archetypeName }: ResultCardProps) {
  const date = new Date(result.completed_at).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Link
      href={`/profile/result/${result.id}`}
      className="surface block p-6 hover:border-gold-primary transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3
            className="text-lg font-light mb-1"
            style={{ color: 'var(--gold-primary)' }}
          >
            {archetypeName}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-mist)' }}>
            {date}
          </p>
        </div>
        <span style={{ color: 'var(--gold-muted)' }}>→</span>
      </div>
    </Link>
  );
}
```

**Step 2: Create profile page**

Create: `app/profile/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserResults } from '@/lib/session-store';
import { loadQuizData } from '@/lib/quiz-data';
import ResultCard from '@/components/ResultCard';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const results = await getUserResults();
  const quizData = await loadQuizData();

  // Map profile_id to archetype_name
  const getArchetypeName = (profileId: string): string => {
    const profile = quizData.profiles.find((p) => p.id === profileId);
    if (profile) return profile.archetype_name;
    if (profileId === quizData.fallback_profile.id) {
      return quizData.fallback_profile.archetype_name;
    }
    return 'Unbekannt';
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className="text-2xl font-light mb-1"
              style={{ color: 'var(--text-ivory)' }}
            >
              Meine Ergebnisse
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-mist)' }}>
              {user.email}
            </p>
          </div>
          <Link
            href="/quiz/cosmic-archetype"
            className="btn-luxury text-sm px-4 py-2"
          >
            NEUES QUIZ
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="surface p-12 text-center">
            <div className="text-4xl mb-4">✧</div>
            <h2
              className="text-lg mb-2"
              style={{ color: 'var(--gold-primary)' }}
            >
              Noch keine Ergebnisse
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-mist)' }}>
              Starte dein erstes Quiz, um deinen kosmischen Archetyp zu entdecken.
            </p>
            <Link href="/quiz/cosmic-archetype" className="btn-luxury">
              QUIZ STARTEN
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <ResultCard
                key={result.id}
                result={result}
                archetypeName={getArchetypeName(result.profile_id)}
              />
            ))}
          </div>
        )}

        <form action="/auth/signout" method="post" className="mt-12 text-center">
          <button
            type="submit"
            className="text-sm underline"
            style={{ color: 'var(--text-mist)' }}
          >
            Abmelden
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Step 3: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add app/profile/ components/ResultCard.tsx
git commit -m "feat: add profile page with results list"
```

---

## Task 10: Create Sign Out Route

**Files:**
- Create: `astromirror-quiz-integration/astromirror/app/auth/signout/route.ts`

**Step 1: Create signout route**

Create: `app/auth/signout/route.ts`

```typescript
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

**Step 2: Commit**

```bash
git add app/auth/signout/
git commit -m "feat: add sign out route"
```

---

## Task 11: Create Result Detail Page

**Files:**
- Create: `astromirror-quiz-integration/astromirror/app/profile/result/[id]/page.tsx`
- Create: `astromirror-quiz-integration/astromirror/components/ProfileResult.tsx`

**Step 1: Extract result display component**

Create: `components/ProfileResult.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import type { Profile, FallbackProfile, ScoreState, Disclaimer } from '@/types/quiz';

const tokens = {
  bg_primary: '#070708',
  bg_surface: '#0F1012',
  gold_primary: '#D4AF37',
  gold_muted: '#B8975E',
  emerald_deep: '#0F3D2E',
  text_ivory: '#F6F0E1',
  text_mist: '#CFC7B8',
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

interface ProfileResultProps {
  profile: Profile | FallbackProfile;
  scores: ScoreState;
  disclaimer?: Disclaimer;
  showCTA?: boolean;
  onCTAClick?: () => void;
}

export default function ProfileResult({
  profile,
  scores,
  disclaimer,
  showCTA = true,
  onCTAClick,
}: ProfileResultProps) {
  const isFullProfile = 'strengths' in profile;

  const handleCTA = () => {
    if ('cta_url' in profile) {
      onCTAClick?.();
      window.location.href = profile.cta_url;
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="text-center max-w-xl mx-auto"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ fontSize: '4rem', marginBottom: '1.5rem', color: tokens.gold_primary }}
      >
        ◈
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p style={{ color: tokens.gold_muted, fontSize: '0.9rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
          DEIN KOSMISCHER ARCHETYP
        </p>
        <h1 style={{ color: tokens.text_ivory, fontSize: '2.5rem', fontWeight: 300, marginBottom: '0.25rem' }}>
          {profile.archetype_name}
        </h1>
        <p style={{ color: tokens.gold_primary, fontSize: '1rem', letterSpacing: '0.1em', marginBottom: '2rem' }}>
          {profile.archetype_subtitle}
        </p>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ color: tokens.text_ivory, fontSize: '1.3rem', fontWeight: 400, fontStyle: 'italic', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}
      >
        {profile.headline}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{ color: tokens.text_mist, fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', whiteSpace: 'pre-line' }}
      >
        {profile.description}
      </motion.div>

      {isFullProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', textAlign: 'left' }}
        >
          <div>
            <h4 style={{ color: tokens.gold_primary, marginBottom: '0.75rem' }}>Stärken</h4>
            {(profile as Profile).strengths.map((s, i) => (
              <p key={i} style={{ color: tokens.text_mist, fontSize: '0.9rem', marginBottom: '0.5rem' }}>• {s}</p>
            ))}
          </div>
          <div>
            <h4 style={{ color: tokens.gold_muted, marginBottom: '0.75rem' }}>Wachstum</h4>
            {(profile as Profile).growth_edges.map((g, i) => (
              <p key={i} style={{ color: tokens.text_mist, fontSize: '0.9rem', marginBottom: '0.5rem' }}>• {g}</p>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        style={{ background: tokens.bg_surface, padding: '24px', borderLeft: `3px solid ${tokens.gold_muted}`, marginBottom: '2rem', textAlign: 'left' }}
      >
        <p style={{ color: tokens.text_ivory, fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {profile.bridge_text}
        </p>
      </motion.div>

      {showCTA && 'cta_text' in profile && (
        <motion.button
          onClick={handleCTA}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '16px 48px',
            background: tokens.emerald_deep,
            color: tokens.gold_primary,
            border: `1px solid ${tokens.gold_muted}`,
            fontSize: '1rem',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            marginBottom: '2rem',
          }}
        >
          {profile.cta_text}
        </motion.button>
      )}

      {disclaimer && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5 }}
          style={{ color: tokens.text_mist, fontSize: '0.75rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}
        >
          {disclaimer.full}
        </motion.p>
      )}
    </motion.div>
  );
}
```

**Step 2: Create result detail page**

Create: `app/profile/result/[id]/page.tsx`

```typescript
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getResultById } from '@/lib/session-store';
import { loadQuizData } from '@/lib/quiz-data';
import ProfileResult from '@/components/ProfileResult';
import type { Profile, FallbackProfile, ScoreState } from '@/types/quiz';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultDetailPage({ params }: PageProps) {
  const { id } = await params;

  const dbResult = await getResultById(id);
  if (!dbResult) {
    notFound();
  }

  const quizData = await loadQuizData();

  // Resolve full profile from quiz data
  let profile: Profile | FallbackProfile | undefined;
  profile = quizData.profiles.find((p) => p.id === dbResult.profile_id);
  if (!profile && dbResult.profile_id === quizData.fallback_profile.id) {
    profile = quizData.fallback_profile;
  }

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'var(--bg-obsidian)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/profile"
            className="text-sm flex items-center gap-2"
            style={{ color: 'var(--gold-muted)' }}
          >
            ← Zurück zu meinen Ergebnissen
          </Link>
        </div>

        <ProfileResult
          profile={profile}
          scores={dbResult.scores as ScoreState}
          disclaimer={quizData.quiz_meta.disclaimer}
          showCTA={true}
        />

        <div className="mt-12 text-center">
          <Link href="/quiz/cosmic-archetype" className="btn-luxury">
            QUIZ WIEDERHOLEN
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add app/profile/result/ components/ProfileResult.tsx
git commit -m "feat: add result detail page with extracted ProfileResult component"
```

---

## Task 12: Add Navigation Header

**Files:**
- Create: `astromirror-quiz-integration/astromirror/components/Header.tsx`
- Modify: `astromirror-quiz-integration/astromirror/app/layout.tsx`

**Step 1: Create Header component**

Create: `components/Header.tsx`

```typescript
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      style={{ background: 'rgba(7, 7, 8, 0.9)', backdropFilter: 'blur(8px)' }}
    >
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-lg font-light tracking-wide"
          style={{ color: 'var(--gold-primary)' }}
        >
          AstroMirror
        </Link>

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-sm"
                style={{ color: 'var(--text-mist)' }}
              >
                Meine Ergebnisse
              </Link>
              <Link
                href="/quiz/cosmic-archetype"
                className="text-sm"
                style={{ color: 'var(--gold-muted)' }}
              >
                Quiz
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm"
              style={{ color: 'var(--gold-muted)' }}
            >
              Anmelden
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
```

**Step 2: Add Header to layout**

Modify: `app/layout.tsx`

Replace entire file:

```typescript
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: {
    default: 'AstroMirror | Kosmischer Spiegel',
    template: '%s | AstroMirror',
  },
  description: 'Premium astrologische Berechnungen mit Voice-Agent. Für Menschen, die tiefer schauen wollen.',
  keywords: ['Astrologie', 'Horoskop', 'Geburtshoroskop', 'Voice Agent', 'Premium'],
  authors: [{ name: 'AstroMirror' }],
  metadataBase: new URL('https://astromirror.io'),
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'AstroMirror',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-obsidian text-ivory antialiased">
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
```

**Step 3: Verify TypeScript compiles**

Run: `npm run type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add components/Header.tsx app/layout.tsx
git commit -m "feat: add navigation header with auth-aware links"
```

---

## Task 13: Final Verification

**Step 1: Run full type check**

```bash
npm run type-check
```
Expected: No errors

**Step 2: Run linter**

```bash
npm run lint
```
Expected: No errors (or only warnings)

**Step 3: Run build**

```bash
npm run build
```
Expected: Build succeeds

**Step 4: Manual test flow**

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000/quiz/cosmic-archetype`
3. Verify redirect to `/login`
4. Enter email, receive magic link
5. Click link, verify redirect to quiz
6. Complete quiz, verify result saved
7. Visit `/profile`, verify result appears
8. Click result, verify detail page works

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Supabase persistence integration"
```

---

## Summary

**Files created:**
- `supabase/migrations/001_initial_schema.sql`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`
- `middleware.ts`
- `types/database.ts`
- `app/login/page.tsx`
- `app/auth/callback/route.ts`
- `app/auth/signout/route.ts`
- `app/profile/page.tsx`
- `app/profile/result/[id]/page.tsx`
- `components/ResultCard.tsx`
- `components/ProfileResult.tsx`
- `components/Header.tsx`

**Files modified:**
- `package.json` (dependencies)
- `lib/session-store.ts` (Supabase refactor)
- `app/layout.tsx` (Header added)

**Total tasks:** 13
**Estimated commits:** 13

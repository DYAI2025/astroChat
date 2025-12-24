// AstroMirror Quiz Session Store
// Supabase implementation with anonymous sessions

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
 * Ensure we have a user (anonymous if not logged in)
 */
async function ensureUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) return user;

  // Sign in anonymously
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw new Error(`Failed to create anonymous session: ${error.message}`);

  return data.user;
}

/**
 * Save a quiz session
 */
export async function saveSession(session: QuizSession): Promise<void> {
  const supabase = await createClient();
  const user = await ensureUser(supabase);

  if (!user) throw new Error('Failed to get or create user');

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
  const user = await ensureUser(supabase);

  if (!user) throw new Error('Failed to get or create user');

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

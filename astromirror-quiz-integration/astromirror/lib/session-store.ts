// AstroMirror Quiz Session Store
// In-memory implementation for development
// Replace with Supabase in production

import type { QuizSession, QuizResult } from '../types/quiz';

// In-memory stores
const sessions = new Map<string, QuizSession>();
const results = new Map<string, QuizResult>();

// Session TTL: 24 hours
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Save a quiz session
 */
export async function saveSession(session: QuizSession): Promise<void> {
  sessions.set(session.id, { ...session });
}

/**
 * Get a quiz session by ID
 */
export async function getSession(sessionId: string): Promise<QuizSession | null> {
  const session = sessions.get(sessionId);
  
  if (!session) return null;
  
  // Check TTL
  const startedAt = new Date(session.started_at).getTime();
  if (Date.now() - startedAt > SESSION_TTL_MS) {
    sessions.delete(sessionId);
    return null;
  }
  
  return { ...session };
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
  results.set(result.session_id, { ...result });
}

/**
 * Get quiz result by session ID
 */
export async function getResult(sessionId: string): Promise<QuizResult | null> {
  const result = results.get(sessionId);
  return result ? { ...result } : null;
}

/**
 * Cleanup expired sessions (call periodically)
 */
export function cleanupExpiredSessions(): number {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [id, session] of sessions.entries()) {
    const startedAt = new Date(session.started_at).getTime();
    if (now - startedAt > SESSION_TTL_MS) {
      sessions.delete(id);
      cleaned++;
    }
  }
  
  return cleaned;
}

/**
 * Get session statistics (for analytics)
 */
export function getSessionStats(): {
  active: number;
  completed: number;
  results: number;
} {
  let completed = 0;
  for (const session of sessions.values()) {
    if (session.completed_at) completed++;
  }
  
  return {
    active: sessions.size - completed,
    completed,
    results: results.size,
  };
}

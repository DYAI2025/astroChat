// AstroMirror Quiz Engine
// Scoring-Logik für Kosmischer Archetyp Quiz

import type {
  QuizData,
  Question,
  Answer,
  Profile,
  FallbackProfile,
  ScoreState,
  ScoringKey,
  ElementKey,
  ModalityKey,
  OrientationKey,
  QuizSession,
  QuizResult,
} from '../types/quiz';

const ELEMENT_KEYS: ElementKey[] = ['fire', 'water', 'air', 'earth'];
const MODALITY_KEYS: ModalityKey[] = ['cardinal', 'fixed', 'mutable'];
const ORIENTATION_KEYS: OrientationKey[] = ['solar', 'lunar'];

/**
 * Initialize empty score state
 */
export function initializeScores(): ScoreState {
  return {
    fire: 0,
    water: 0,
    air: 0,
    earth: 0,
    cardinal: 0,
    fixed: 0,
    mutable: 0,
    solar: 0,
    lunar: 0,
  };
}

/**
 * Apply scoring from a single answer to the score state
 */
export function applyAnswerScoring(
  scores: ScoreState,
  answer: Answer
): ScoreState {
  const newScores = { ...scores };
  
  for (const [key, value] of Object.entries(answer.scoring)) {
    if (key in newScores && typeof value === 'number') {
      newScores[key as keyof ScoreState] += value;
    }
  }
  
  return newScores;
}

/**
 * Calculate total scores from all answered questions
 */
export function calculateTotalScores(
  answers: Answer[]
): ScoreState {
  return answers.reduce(
    (scores, answer) => applyAnswerScoring(scores, answer),
    initializeScores()
  );
}

/**
 * Get the winning key from a subset of score keys
 * Returns the key with highest score, with deterministic tiebreaking
 */
function getWinningKey<T extends ScoringKey>(
  scores: ScoreState,
  keys: readonly T[]
): { key: T; score: number } {
  let maxKey = keys[0];
  let maxScore = scores[maxKey];
  
  for (const key of keys) {
    const score = scores[key];
    if (score > maxScore) {
      maxKey = key;
      maxScore = score;
    }
  }
  
  return { key: maxKey, score: maxScore };
}

/**
 * Determine profile based on scoring matrix
 * Uses weighted matrix approach with orientation as tiebreaker
 */
export function determineProfile(
  scores: ScoreState,
  profiles: Profile[],
  fallbackProfile: FallbackProfile
): { profile: Profile | FallbackProfile; isFallback: boolean } {
  
  const element = getWinningKey(scores, ELEMENT_KEYS);
  const modality = getWinningKey(scores, MODALITY_KEYS);
  const orientation = getWinningKey(scores, ORIENTATION_KEYS);
  
  // Construct expected profile ID pattern
  const expectedId = `${orientation.key}_${modality.key}_${element.key}`;
  
  // First: try exact match
  const exactMatch = profiles.find(p => p.id === expectedId);
  if (exactMatch) {
    return { profile: exactMatch, isFallback: false };
  }
  
  // Second: find best matching profile using criteria
  const matches = profiles.map(profile => {
    const criteria = profile.matching_criteria;
    let score = 0;
    let matchCount = 0;
    
    // Check primary criterion
    if (scores[criteria.primary.key] >= criteria.primary.min_score) {
      score += 3;
      matchCount++;
    }
    
    // Check secondary criterion
    if (scores[criteria.secondary.key] >= criteria.secondary.min_score) {
      score += 2;
      matchCount++;
    }
    
    // Check tertiary criterion
    if (scores[criteria.tertiary.key] >= criteria.tertiary.min_score) {
      score += 1;
      matchCount++;
    }
    
    // Bonus for element match
    if (profile.element === element.key) {
      score += 0.5;
    }
    
    // Bonus for orientation match (tiebreaker as per spec)
    if (profile.orientation === orientation.key) {
      score += 0.25;
    }
    
    return { profile, score, matchCount };
  });
  
  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);
  
  // If best match has at least 2 criteria met, use it
  if (matches[0] && matches[0].matchCount >= 2) {
    return { profile: matches[0].profile, isFallback: false };
  }
  
  // Fallback: Kosmischer Hybrid
  return { profile: fallbackProfile, isFallback: true };
}

/**
 * Find an answer by ID within a question
 */
export function findAnswer(
  question: Question,
  answerId: string
): Answer | undefined {
  return question.answers.find(a => a.id === answerId);
}

/**
 * Find a question by ID
 */
export function findQuestion(
  questions: Question[],
  questionId: string
): Question | undefined {
  return questions.find(q => q.id === questionId);
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `quiz_${timestamp}_${randomPart}`;
}

/**
 * Create a new quiz session
 */
export function createSession(): QuizSession {
  return {
    id: generateSessionId(),
    started_at: new Date().toISOString(),
    answers: {},
    current_question: 0,
    completed_at: undefined,
    profile_id: undefined,
  };
}

/**
 * Process a complete quiz session and return result
 */
export function processQuizResult(
  session: QuizSession,
  quizData: QuizData
): QuizResult {
  // Collect all answered Answer objects
  const answeredAnswers: Answer[] = [];
  
  for (const [questionId, answerId] of Object.entries(session.answers)) {
    const question = findQuestion(quizData.questions, questionId);
    if (question) {
      const answer = findAnswer(question, answerId);
      if (answer) {
        answeredAnswers.push(answer);
      }
    }
  }
  
  // Calculate scores
  const scores = calculateTotalScores(answeredAnswers);
  
  // Determine profile
  const { profile, isFallback } = determineProfile(
    scores,
    quizData.profiles,
    quizData.fallback_profile
  );
  
  return {
    session_id: session.id,
    profile,
    scores,
    completed_at: session.completed_at || new Date().toISOString(),
    is_fallback: isFallback,
  };
}

/**
 * Validate that a session has all required answers
 */
export function validateSessionComplete(
  session: QuizSession,
  totalQuestions: number
): boolean {
  return Object.keys(session.answers).length === totalQuestions;
}

/**
 * Get progress information
 */
export function getProgress(
  session: QuizSession,
  totalQuestions: number
): { current: number; total: number; percentage: number } {
  const answered = Object.keys(session.answers).length;
  return {
    current: answered,
    total: totalQuestions,
    percentage: Math.round((answered / totalQuestions) * 100),
  };
}

// AstroMirror Quiz Data Loader
// Server-side only – loads and caches quiz JSON

import type { QuizData } from '../types/quiz';

// In production: load from validated JSON file
// For now: inline the critical structure, actual JSON imported at build time

let cachedQuizData: QuizData | null = null;

/**
 * Load quiz data from JSON file
 * Uses dynamic import for Next.js compatibility
 */
export async function loadQuizData(): Promise<QuizData> {
  if (cachedQuizData) {
    return cachedQuizData;
  }
  
  // In production, this would be:
  // const data = await import('../data/cosmic-archetype-quiz.json');
  // cachedQuizData = data.default as QuizData;
  
  // For now, we fetch from a known path or environment variable
  const dataPath = process.env.QUIZ_DATA_PATH || '/data/cosmic-archetype-quiz.json';
  
  try {
    // In Next.js API routes, we can use fs
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const fullPath = path.join(process.cwd(), 'public', dataPath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    cachedQuizData = JSON.parse(fileContent) as QuizData;
    
    return cachedQuizData;
  } catch {
    // Fallback: throw if data cannot be loaded
    throw new Error(`Failed to load quiz data from ${dataPath}`);
  }
}

/**
 * Synchronous getter for cached data (use after initial load)
 */
export function getQuizData(): QuizData {
  if (!cachedQuizData) {
    throw new Error('Quiz data not loaded. Call loadQuizData() first.');
  }
  return cachedQuizData;
}

/**
 * Clear cache (useful for development/testing)
 */
export function clearQuizDataCache(): void {
  cachedQuizData = null;
}

/**
 * Validate quiz data structure
 */
export function validateQuizData(data: unknown): data is QuizData {
  if (!data || typeof data !== 'object') return false;
  
  const d = data as Record<string, unknown>;
  
  return (
    'quiz_meta' in d &&
    'questions' in d &&
    'profiles' in d &&
    'fallback_profile' in d &&
    Array.isArray(d.questions) &&
    Array.isArray(d.profiles)
  );
}

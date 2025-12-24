// POST /api/quiz/start
// Starts a new quiz session and returns first question

import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/quiz-engine';
import { loadQuizData } from '@/lib/quiz-data';
import { saveSession } from '@/lib/session-store';
import type { StartQuizResponse } from '@/types/quiz';

export async function POST(request: NextRequest) {
  try {
    // Load quiz data
    const quizData = await loadQuizData();
    
    // Create new session
    const session = createSession();
    
    // Store session
    await saveSession(session);
    
    // Get first question
    const firstQuestion = quizData.questions.find(q => q.order === 1);
    
    if (!firstQuestion) {
      return NextResponse.json(
        { error: 'Quiz configuration error: no first question' },
        { status: 500 }
      );
    }
    
    const response: StartQuizResponse = {
      session_id: session.id,
      first_question: firstQuestion,
      total_questions: quizData.questions.length,
      meta: {
        title: quizData.quiz_meta.title,
        subtitle: quizData.quiz_meta.subtitle,
        disclaimer: quizData.quiz_meta.disclaimer,
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Quiz start error:', error);
    return NextResponse.json(
      { error: 'Failed to start quiz' },
      { status: 500 }
    );
  }
}

// Prevent caching
export const dynamic = 'force-dynamic';

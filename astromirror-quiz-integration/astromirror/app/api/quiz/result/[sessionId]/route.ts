// GET /api/quiz/result/[sessionId]
// Returns quiz result with profile, scores, and design tokens

import { NextRequest, NextResponse } from 'next/server';
import { loadQuizData } from '@/lib/quiz-data';
import { getResult, getSession } from '@/lib/session-store';
import { processQuizResult } from '@/lib/quiz-engine';
import type { GetResultResponse } from '@/types/quiz';

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }
    
    // Load quiz data for design tokens and disclaimer
    const quizData = await loadQuizData();
    
    // Try to get cached result first
    let result = await getResult(sessionId);
    
    // If no cached result, recalculate from session
    if (!result) {
      const session = await getSession(sessionId);
      
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found or expired' },
          { status: 404 }
        );
      }
      
      if (!session.completed_at) {
        return NextResponse.json(
          { error: 'Quiz not completed yet' },
          { status: 400 }
        );
      }
      
      result = processQuizResult(session, quizData);
    }
    
    const response: GetResultResponse = {
      result,
      design_tokens: quizData.quiz_meta.design_tokens,
      disclaimer: quizData.quiz_meta.disclaimer,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Quiz result error:', error);
    return NextResponse.json(
      { error: 'Failed to get result' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

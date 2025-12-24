// POST /api/quiz/answer
// Processes an answer and returns next question or result URL

import { NextRequest, NextResponse } from 'next/server';
import { loadQuizData } from '@/lib/quiz-data';
import { 
  getSession, 
  updateSessionAnswer, 
  completeSession,
  saveResult 
} from '@/lib/session-store';
import { 
  findQuestion, 
  findAnswer, 
  processQuizResult,
  getProgress 
} from '@/lib/quiz-engine';
import type { AnswerQuizRequest, AnswerQuizResponse } from '@/types/quiz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AnswerQuizRequest;
    const { session_id, question_id, answer_id } = body;
    
    // Validate request
    if (!session_id || !question_id || !answer_id) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, question_id, answer_id' },
        { status: 400 }
      );
    }
    
    // Load quiz data
    const quizData = await loadQuizData();
    
    // Get session
    const session = await getSession(session_id);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }
    
    // Validate question exists
    const question = findQuestion(quizData.questions, question_id);
    if (!question) {
      return NextResponse.json(
        { error: 'Invalid question_id' },
        { status: 400 }
      );
    }
    
    // Validate answer exists for question
    const answer = findAnswer(question, answer_id);
    if (!answer) {
      return NextResponse.json(
        { error: 'Invalid answer_id for this question' },
        { status: 400 }
      );
    }
    
    // Prevent re-answering same question
    if (session.answers[question_id]) {
      return NextResponse.json(
        { error: 'Question already answered' },
        { status: 400 }
      );
    }
    
    // Update session with answer
    const updatedSession = await updateSessionAnswer(session_id, question_id, answer_id);
    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }
    
    // Calculate progress
    const progress = getProgress(updatedSession, quizData.questions.length);
    const isComplete = progress.current >= quizData.questions.length;
    
    // Determine next question or complete quiz
    let nextQuestion = null;
    let resultUrl: string | undefined;
    
    if (isComplete) {
      // Calculate and save result
      const result = processQuizResult(updatedSession, quizData);
      await saveResult(result);
      
      // Mark session complete
      await completeSession(session_id, result.profile.id);
      
      resultUrl = `/api/quiz/result/${session_id}`;
    } else {
      // Get next question by order
      const nextOrder = progress.current + 1;
      nextQuestion = quizData.questions.find(q => q.order === nextOrder) || null;
    }
    
    const response: AnswerQuizResponse = {
      next_question: nextQuestion,
      progress: {
        current: progress.current,
        total: progress.total,
      },
      is_complete: isComplete,
      result_url: resultUrl,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Quiz answer error:', error);
    return NextResponse.json(
      { error: 'Failed to process answer' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

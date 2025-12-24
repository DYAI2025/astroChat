/**
 * API Route: Quiz Start
 * POST /api/quiz/cosmic-archetype/start
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import quizData from '@/data/cosmic-archetype-quiz.json'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Get user from auth header if present
    let userId: string | null = null
    const authHeader = request.headers.get('authorization')
    
    if (authHeader?.startsWith('Bearer ')) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.slice(7))
      userId = user?.id || null
    }

    // Create quiz session
    const { data: session, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        quiz_type: 'cosmic-archetype',
        answers: [],
        metadata: {
          started_via: 'web',
          user_agent: request.headers.get('user-agent'),
        },
      })
      .select()
      .single()

    if (error) throw error

    // Prepare first question (without scoring data)
    const firstQuestion = quizData.questions[0]
    const cleanQuestion = {
      id: firstQuestion.id,
      order: firstQuestion.order,
      headline: firstQuestion.headline,
      question_text: firstQuestion.question_text,
      question_subtext: firstQuestion.question_subtext,
      image_gen_prompt: firstQuestion.image_gen_prompt,
      answers: firstQuestion.answers.map(a => ({
        id: a.id,
        text: a.text,
      })),
    }

    return NextResponse.json({
      session_id: session.id,
      quiz_meta: quizData.quiz_meta,
      first_question: cleanQuestion,
      total_questions: quizData.questions.length,
    })
  } catch (error) {
    console.error('Quiz start error:', error)
    return NextResponse.json(
      { error: 'Failed to start quiz' },
      { status: 500 }
    )
  }
}

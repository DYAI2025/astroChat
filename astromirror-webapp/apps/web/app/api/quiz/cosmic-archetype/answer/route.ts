/**
 * API Route: Quiz Answer
 * POST /api/quiz/cosmic-archetype/answer
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import quizData from '@/data/cosmic-archetype-quiz.json'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Types
interface Answer {
  question_id: string
  answer_id: string
  answered_at: string
}

interface Scores {
  fire: number
  water: number
  air: number
  earth: number
  cardinal: number
  fixed: number
  mutable: number
  solar: number
  lunar: number
}

function calculateScores(answers: Answer[]): Scores {
  const scores: Scores = {
    fire: 0, water: 0, air: 0, earth: 0,
    cardinal: 0, fixed: 0, mutable: 0,
    solar: 0, lunar: 0,
  }

  const questionsMap = new Map(
    quizData.questions.map(q => [q.id, q])
  )

  for (const answer of answers) {
    const question = questionsMap.get(answer.question_id)
    if (!question) continue

    const answerData = question.answers.find(a => a.id === answer.answer_id)
    if (!answerData?.scoring) continue

    for (const [key, value] of Object.entries(answerData.scoring)) {
      if (key in scores) {
        scores[key as keyof Scores] += value as number
      }
    }
  }

  return scores
}

function determineProfile(scores: Scores): string {
  const elements = ['fire', 'water', 'air', 'earth'] as const
  const modalities = ['cardinal', 'fixed', 'mutable'] as const
  const orientations = ['solar', 'lunar'] as const

  const elementWinner = elements.reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  )
  const modalityWinner = modalities.reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  )
  const orientationWinner = orientations.reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  )

  return `${orientationWinner}_${modalityWinner}_${elementWinner}`
}

export async function POST(request: NextRequest) {
  try {
    const { session_id, question_id, answer_id } = await request.json()

    if (!session_id || !question_id || !answer_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current session
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.completed_at) {
      return NextResponse.json(
        { error: 'Quiz already completed' },
        { status: 400 }
      )
    }

    // Validate question and answer
    const question = quizData.questions.find(q => q.id === question_id)
    if (!question) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      )
    }

    const answer = question.answers.find(a => a.id === answer_id)
    if (!answer) {
      return NextResponse.json(
        { error: 'Invalid answer ID' },
        { status: 400 }
      )
    }

    // Add answer to session
    const answers: Answer[] = session.answers || []
    answers.push({
      question_id,
      answer_id,
      answered_at: new Date().toISOString(),
    })

    // Find next question
    const currentIndex = quizData.questions.findIndex(q => q.id === question_id)
    const nextIndex = currentIndex + 1
    const isComplete = nextIndex >= quizData.questions.length

    // Prepare update
    const updateData: Record<string, unknown> = { answers }

    if (isComplete) {
      const scores = calculateScores(answers)
      const profileId = determineProfile(scores)

      updateData.completed_at = new Date().toISOString()
      updateData.scores = scores
      updateData.profile_id = profileId
    }

    // Update session
    const { error: updateError } = await supabase
      .from('quiz_sessions')
      .update(updateData)
      .eq('id', session_id)

    if (updateError) throw updateError

    // Prepare next question
    let nextQuestion = null
    if (!isComplete) {
      const q = quizData.questions[nextIndex]
      nextQuestion = {
        id: q.id,
        order: q.order,
        headline: q.headline,
        question_text: q.question_text,
        question_subtext: q.question_subtext,
        image_gen_prompt: q.image_gen_prompt,
        answers: q.answers.map(a => ({
          id: a.id,
          text: a.text,
        })),
      }
    }

    return NextResponse.json({
      next_question: nextQuestion,
      is_complete: isComplete,
      progress: answers.length / quizData.questions.length,
    })
  } catch (error) {
    console.error('Quiz answer error:', error)
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
}

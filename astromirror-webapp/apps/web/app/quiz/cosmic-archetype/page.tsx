/**
 * AstroMirror - Cosmic Archetype Quiz
 * Interactive quiz with luxury aesthetics
 */
'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// Types
interface QuizAnswer {
  id: string
  text: string
}

interface QuizQuestion {
  id: string
  order: number
  headline: string
  question_text: string
  question_subtext?: string
  image_gen_prompt?: string
  answers: QuizAnswer[]
}

interface QuizProfile {
  id: string
  archetype_name: string
  archetype_subtitle?: string
  headline: string
  description: string
  strengths?: string[]
  growth_edges?: string[]
  cosmic_insight?: string
  bridge_text?: string
  cta_text?: string
  cta_url?: string
  trading_card_visual?: {
    background: string
    accent_color: string
    symbol: string
  }
}

interface QuizState {
  sessionId: string | null
  currentQuestion: QuizQuestion | null
  questionNumber: number
  totalQuestions: number
  isComplete: boolean
  profile: QuizProfile | null
  scores: Record<string, number>
  isLoading: boolean
  error: string | null
}

// Animation variants
const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
}

export default function CosmicArchetypeQuiz() {
  const [state, setState] = useState<QuizState>({
    sessionId: null,
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 7,
    isComplete: false,
    profile: null,
    scores: {},
    isLoading: false,
    error: null,
  })

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Start quiz
  const startQuiz = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/quiz/cosmic-archetype/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error('Quiz konnte nicht gestartet werden')

      const data = await response.json()

      setState(s => ({
        ...s,
        sessionId: data.session_id,
        currentQuestion: data.first_question,
        questionNumber: 1,
        totalQuestions: data.total_questions,
        isLoading: false,
      }))
    } catch (err) {
      setState(s => ({
        ...s,
        error: err instanceof Error ? err.message : 'Unbekannter Fehler',
        isLoading: false,
      }))
    }
  }, [])

  // Submit answer
  const submitAnswer = useCallback(async (answerId: string) => {
    if (!state.sessionId || !state.currentQuestion || isTransitioning) return

    setSelectedAnswer(answerId)
    setIsTransitioning(true)

    // Brief delay for visual feedback
    await new Promise(r => setTimeout(r, 400))

    try {
      const response = await fetch('/api/quiz/cosmic-archetype/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: state.sessionId,
          question_id: state.currentQuestion.id,
          answer_id: answerId,
        }),
      })

      if (!response.ok) throw new Error('Antwort konnte nicht gespeichert werden')

      const data = await response.json()

      if (data.is_complete) {
        // Fetch result
        const resultResponse = await fetch(
          `/api/quiz/cosmic-archetype/result/${state.sessionId}`
        )
        const resultData = await resultResponse.json()

        setState(s => ({
          ...s,
          isComplete: true,
          profile: resultData.profile,
          scores: resultData.scores,
        }))
      } else {
        setState(s => ({
          ...s,
          currentQuestion: data.next_question,
          questionNumber: s.questionNumber + 1,
        }))
      }
    } catch (err) {
      setState(s => ({
        ...s,
        error: err instanceof Error ? err.message : 'Unbekannter Fehler',
      }))
    } finally {
      setSelectedAnswer(null)
      setIsTransitioning(false)
    }
  }, [state.sessionId, state.currentQuestion, isTransitioning])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!state.currentQuestion || isTransitioning) return

      const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 }
      const index = keyMap[e.key]

      if (index !== undefined && state.currentQuestion.answers[index]) {
        submitAnswer(state.currentQuestion.answers[index].id)
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [state.currentQuestion, isTransitioning, submitAnswer])

  return (
    <div className="min-h-screen pb-20">
      {/* Progress bar */}
      {state.sessionId && !state.isComplete && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-graphite">
          <motion.div
            className="h-full bg-gradient-to-r from-gold to-gold-muted"
            initial={{ width: 0 }}
            animate={{ width: `${(state.questionNumber / state.totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <main className="container-narrow pt-12">
        <AnimatePresence mode="wait">
          {/* Landing State */}
          {!state.sessionId && !state.isComplete && (
            <motion.div
              key="landing"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center py-16"
            >
              {/* Hero */}
              <div className="mb-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-gold/20 via-emerald-deep/20 to-gold/10 flex items-center justify-center"
                >
                  <span className="text-6xl">🪞</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-display text-gradient-gold mb-4">
                  Dein Kosmischer Archetyp
                </h1>
                
                <p className="text-lg text-mist/80 max-w-md mx-auto mb-2">
                  Welche kosmische Signatur trägt deine Seele?
                </p>
                
                <p className="text-sm text-mist/50">
                  7 Fragen • ca. 3 Minuten
                </p>
              </div>

              {/* Start button */}
              <button
                onClick={startQuiz}
                disabled={state.isLoading}
                className="btn-primary px-10 py-4 text-lg group"
              >
                {state.isLoading ? (
                  <span className="spinner mr-2" />
                ) : (
                  <span className="mr-2 group-hover:animate-pulse">✨</span>
                )}
                Spiegel öffnen
              </button>

              {/* Error */}
              {state.error && (
                <p className="mt-4 text-red-400 text-sm">{state.error}</p>
              )}

              {/* Disclaimer */}
              <div className="mt-16 p-4 bg-graphite/50 rounded-xl border border-gold/10">
                <p className="text-xs text-mist/50">
                  Zur Reflexion & Unterhaltung. Basiert auf archetypischen Konzepten, 
                  nicht auf wissenschaftlichen Persönlichkeitstests.
                </p>
              </div>
            </motion.div>
          )}

          {/* Question State */}
          {state.currentQuestion && !state.isComplete && (
            <motion.div
              key={`question-${state.currentQuestion.id}`}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="py-8"
            >
              {/* Question header */}
              <div className="text-center mb-10">
                <p className="text-sm text-gold/70 mb-3">
                  Frage {state.questionNumber} von {state.totalQuestions}
                </p>
                
                <h2 className="text-2xl md:text-3xl font-display text-ivory mb-3">
                  {state.currentQuestion.headline}
                </h2>
                
                <p className="text-lg text-mist/80 max-w-lg mx-auto">
                  {state.currentQuestion.question_text}
                </p>
                
                {state.currentQuestion.question_subtext && (
                  <p className="text-sm text-mist/50 mt-2 italic">
                    {state.currentQuestion.question_subtext}
                  </p>
                )}
              </div>

              {/* Answers */}
              <div className="space-y-4">
                {state.currentQuestion.answers.map((answer, index) => (
                  <motion.button
                    key={answer.id}
                    custom={index}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    onClick={() => submitAnswer(answer.id)}
                    disabled={isTransitioning}
                    className={`
                      w-full quiz-answer text-left p-5 md:p-6
                      ${selectedAnswer === answer.id ? 'selected' : ''}
                      ${isTransitioning && selectedAnswer !== answer.id ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-ivory/90 leading-relaxed pt-1">
                        {answer.text}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Keyboard hint */}
              <p className="text-center text-xs text-mist/30 mt-8">
                Tipp: Drücke 1-4 für schnelle Auswahl
              </p>
            </motion.div>
          )}

          {/* Result State */}
          {state.isComplete && state.profile && (
            <motion.div
              key="result"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="py-8"
            >
              {/* Profile Card */}
              <div className="profile-card mb-8 overflow-hidden">
                {/* Header with gradient */}
                <div className="relative py-10 px-6 text-center bg-gradient-to-b from-gold/10 to-transparent">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold/30 to-emerald-deep/30 flex items-center justify-center text-5xl shadow-gold-glow"
                  >
                    {getArchetypeIcon(state.profile.id)}
                  </motion.div>

                  <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">
                    {state.profile.archetype_name}
                  </h2>
                  
                  {state.profile.archetype_subtitle && (
                    <p className="text-gold/70">{state.profile.archetype_subtitle}</p>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-display text-ivory mb-3">
                      {state.profile.headline}
                    </h3>
                    <p className="text-mist/80 leading-relaxed whitespace-pre-line">
                      {state.profile.description}
                    </p>
                  </div>

                  {/* Strengths */}
                  {state.profile.strengths && state.profile.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm text-gold/70 mb-2 uppercase tracking-wider">
                        Stärken
                      </h4>
                      <ul className="space-y-2">
                        {state.profile.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-mist/80">
                            <span className="text-gold mt-0.5">◆</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Growth edges */}
                  {state.profile.growth_edges && state.profile.growth_edges.length > 0 && (
                    <div>
                      <h4 className="text-sm text-gold/70 mb-2 uppercase tracking-wider">
                        Wachstumskanten
                      </h4>
                      <ul className="space-y-2">
                        {state.profile.growth_edges.map((g, i) => (
                          <li key={i} className="flex items-start gap-2 text-mist/80">
                            <span className="text-emerald-accent mt-0.5">◇</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cosmic insight */}
                  {state.profile.cosmic_insight && (
                    <div className="p-4 bg-emerald-deep/20 rounded-xl border border-emerald-accent/20">
                      <p className="text-sm text-ivory/80">
                        ✨ {state.profile.cosmic_insight}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bridge text & CTA */}
                <div className="p-6 md:p-8 border-t border-gold/10 bg-graphite/50">
                  {state.profile.bridge_text && (
                    <p className="text-mist/70 text-sm leading-relaxed mb-6 whitespace-pre-line">
                      {state.profile.bridge_text}
                    </p>
                  )}

                  {state.profile.cta_text && state.profile.cta_url && (
                    <a
                      href={state.profile.cta_url}
                      className="btn-primary w-full py-4 text-center"
                    >
                      {state.profile.cta_text}
                    </a>
                  )}
                </div>
              </div>

              {/* Score breakdown (optional, hidden by default) */}
              <details className="card">
                <summary className="cursor-pointer text-sm text-mist/60 hover:text-gold transition-colors">
                  Deine Scores anzeigen
                </summary>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {Object.entries(state.scores).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-xs text-mist/50 capitalize">{key}</p>
                      <p className="text-gold font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </details>

              {/* Share / Restart */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="btn-ghost flex-1"
                >
                  Neu starten
                </button>
                <button
                  onClick={() => navigator.share?.({ 
                    title: `Ich bin ${state.profile?.archetype_name}`,
                    text: state.profile?.headline,
                    url: window.location.href
                  })}
                  className="btn-primary flex-1"
                >
                  Teilen
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

// Helper function for archetype icons
function getArchetypeIcon(profileId: string): string {
  const icons: Record<string, string> = {
    'solar_cardinal_fire': '🔥',
    'lunar_mutable_water': '🌊',
    'solar_mutable_air': '💨',
    'lunar_fixed_earth': '🏔️',
    'solar_cardinal_earth': '🏛️',
    'solar_fixed_fire': '👑',
    'lunar_cardinal_water': '🌙',
    'cosmic_hybrid': '🌀',
  }
  return icons[profileId] || '✨'
}

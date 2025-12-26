/**
 * AstroMirror - Voice Page
 * Premium Voice Agent Interface
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Types
interface VoiceSession {
  signed_url: string
  signed_url_expires_at: string
  dynamic_variables: Record<string, string>
  limits: {
    minutes_monthly_total: number
    minutes_monthly_used: number
    minutes_remaining: number
  }
  session_id: string
}

interface VoiceMode {
  id: 'analytical' | 'warm'
  label: string
  description: string
  icon: string
}

const VOICE_MODES: VoiceMode[] = [
  {
    id: 'analytical',
    label: 'Analytisch',
    description: 'Präzise, strukturiert, fokussiert',
    icon: '🔮',
  },
  {
    id: 'warm',
    label: 'Einfühlsam',
    description: 'Sanft, reflektierend, empathisch',
    icon: '✨',
  },
]

export default function VoicePage() {
  const [session, setSession] = useState<VoiceSession | null>(null)
  const [voiceMode, setVoiceMode] = useState<'analytical' | 'warm'>('analytical')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Create voice session
  const createSession = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/voice/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voice_mode: voiceMode }),
      })

      if (!response.ok) {
        const data = await response.json()
        
        if (response.status === 402) {
          throw new Error('Premium-Abo erforderlich für Voice-Features.')
        }
        if (response.status === 429) {
          throw new Error('Monatliche Voice-Minuten aufgebraucht.')
        }
        
        throw new Error(data.message || 'Session konnte nicht erstellt werden.')
      }

      const data: VoiceSession = await response.json()
      setSession(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setIsLoading(false)
    }
  }, [voiceMode])

  // Handle widget events
  useEffect(() => {
    const handleWidgetEvent = (event: CustomEvent) => {
      const { type, detail } = event

      switch (type) {
        case 'elevenlabs:conversation:started':
          setIsConnected(true)
          break
        case 'elevenlabs:conversation:ended':
          setIsConnected(false)
          // Refresh session for next conversation
          setSession(null)
          break
        case 'elevenlabs:error':
          setError(detail?.message || 'Voice-Verbindung fehlgeschlagen')
          setIsConnected(false)
          break
      }
    }

    window.addEventListener('elevenlabs:conversation:started', handleWidgetEvent as EventListener)
    window.addEventListener('elevenlabs:conversation:ended', handleWidgetEvent as EventListener)
    window.addEventListener('elevenlabs:error', handleWidgetEvent as EventListener)

    return () => {
      window.removeEventListener('elevenlabs:conversation:started', handleWidgetEvent as EventListener)
      window.removeEventListener('elevenlabs:conversation:ended', handleWidgetEvent as EventListener)
      window.removeEventListener('elevenlabs:error', handleWidgetEvent as EventListener)
    }
  }, [])

  // Calculate minutes display
  const minutesDisplay = session ? {
    remaining: session.limits.minutes_remaining,
    total: session.limits.minutes_monthly_total,
    percentage: (session.limits.minutes_remaining / session.limits.minutes_monthly_total) * 100,
  } : null

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="container-wide py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display text-gradient-gold">
            Voice Agent
          </h1>
          
          {minutesDisplay && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-mist/60">Verbleibend</p>
                <p className="text-sm font-medium text-gold">
                  {minutesDisplay.remaining} Min
                </p>
              </div>
              <div className="w-16 h-2 bg-graphite rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold to-gold-muted"
                  initial={{ width: 0 }}
                  animate={{ width: `${minutesDisplay.percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container-narrow">
        {/* Voice Mode Toggle */}
        <section className="mb-8">
          <h2 className="text-sm text-mist/60 mb-3">Stimmmodus wählen</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {VOICE_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setVoiceMode(mode.id)}
                disabled={isConnected}
                className={`
                  card text-left transition-all duration-300
                  ${voiceMode === mode.id
                    ? 'border-gold bg-gold/5 shadow-gold-glow'
                    : 'hover:border-gold/30'
                  }
                  ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{mode.icon}</span>
                  <div>
                    <h3 className="font-medium text-ivory">{mode.label}</h3>
                    <p className="text-xs text-mist/60 mt-1">{mode.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Main Voice Interface */}
        <section className="voice-widget-shell min-h-[400px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {/* Error State */}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-medium text-ivory mb-2">Fehler</h3>
                <p className="text-mist/80 mb-4">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="btn-ghost text-sm"
                >
                  Erneut versuchen
                </button>
              </motion.div>
            )}

            {/* Initial State - Start Button */}
            {!session && !error && !isLoading && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center p-8"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold/20 to-emerald-deep/30 flex items-center justify-center">
                  <span className="text-4xl">🎙️</span>
                </div>
                
                <h2 className="text-xl font-display text-ivory mb-3">
                  Bereit für deine Reflexion?
                </h2>
                <p className="text-mist/70 mb-6 max-w-sm mx-auto">
                  Dein kosmischer Spiegel wartet. Sprich über Transite, Fragen, oder was dich bewegt.
                </p>
                
                <button
                  onClick={createSession}
                  className="btn-primary px-8 py-4 text-lg"
                >
                  Gespräch starten
                </button>
              </motion.div>
            )}

            {/* Loading State */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-8"
              >
                <div className="spinner mx-auto mb-4 w-8 h-8" />
                <p className="text-mist/70">Verbindung wird hergestellt...</p>
              </motion.div>
            )}

            {/* Active Session - ElevenLabs Widget */}
            {session && !error && (
              <motion.div
                key="widget"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full h-full min-h-[350px] flex flex-col"
              >
                {/* ElevenLabs Widget */}
                <div className="flex-1 relative">
                  {/* 
                    ElevenLabs Conversational AI Widget
                    The widget is loaded via signed URL with dynamic variables
                  */}
                  <elevenlabs-convai
                    signed-url={session.signed_url}
                    dynamic-variables={JSON.stringify(session.dynamic_variables)}
                    className="w-full h-full"
                  />
                </div>

                {/* Connection Status */}
                <div className="flex items-center justify-center gap-2 py-4 border-t border-gold/10">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500 animate-pulse' : 'bg-gold/50'
                    }`}
                  />
                  <span className="text-xs text-mist/60">
                    {isConnected ? 'Verbunden' : 'Bereit'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Usage Info */}
        {session && (
          <section className="mt-8 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-graphite/50 rounded-full border border-gold/10">
              <div className="text-left">
                <p className="text-xs text-mist/50">Diesen Monat</p>
                <p className="text-sm text-ivory">
                  {session.limits.minutes_monthly_used} / {session.limits.minutes_monthly_total} Min genutzt
                </p>
              </div>
              
              {session.limits.minutes_remaining <= 5 && (
                <a href="/upgrade" className="btn-ghost text-xs py-1.5 px-3">
                  Upgrade
                </a>
              )}
            </div>
          </section>
        )}

        {/* Tips */}
        <section className="mt-12 card bg-emerald-deep/20 border-emerald-accent/20">
          <h3 className="font-display text-ivory mb-4">💡 Tipps für dein Gespräch</h3>
          <ul className="space-y-2 text-sm text-mist/80">
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              Frage nach spezifischen Transiten: &ldquo;Was bedeutet Saturn Quadrat Sonne für mich?&rdquo;
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              Reflektiere mit offenen Fragen: &ldquo;Wie zeigt sich mein Aszendent?&rdquo;
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              Der Agent spiegelt – er gibt keine Ratschläge.
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}

// TypeScript declaration for ElevenLabs custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'signed-url'?: string
          'dynamic-variables'?: string
        },
        HTMLElement
      >
    }
  }
}

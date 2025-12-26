/**
 * AstroMirror - Dashboard
 * Main user overview with daily insights and quick actions
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface DailyInsight {
  day: string
  sun_sign: string
  moon_phase: string
  top_transits: Array<{
    transit: string
    orb: number
    theme: string
  }>
  insight_text: string
}

interface UserProfile {
  name: string
  plan: 'free' | 'premium'
  voice_minutes_remaining: number
  voice_minutes_total: number
  has_chart: boolean
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === 'true'

  const [showWelcome, setShowWelcome] = useState(isWelcome)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [insight, setInsight] = useState<DailyInsight | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading - in production, fetch from API
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Simulated data - replace with actual API calls
        setProfile({
          name: 'Sternenwanderer',
          plan: 'free',
          voice_minutes_remaining: 3,
          voice_minutes_total: 3,
          has_chart: true,
        })

        setInsight({
          day: new Date().toISOString().split('T')[0],
          sun_sign: 'Steinbock',
          moon_phase: 'Zunehmender Halbmond',
          top_transits: [
            { transit: 'Venus Trigon Neptun', orb: 1.2, theme: 'Kreativität & Inspiration' },
            { transit: 'Mars Sextil Jupiter', orb: 2.1, theme: 'Tatkraft & Expansion' },
          ],
          insight_text: 'Ein Tag für visionäre Projekte. Die harmonischen Aspekte unterstützen kreative Vorhaben und spirituelle Praxis.',
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Dismiss welcome modal after 5 seconds
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showWelcome])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-mist/60">Lade deine Sterne...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-8">
      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 backdrop-blur-sm px-4"
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card max-w-md text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">✨</div>
              <h2 className="text-2xl font-display text-ivory mb-3">
                Willkommen, {profile?.name}!
              </h2>
              <p className="text-mist/80 mb-6">
                Dein kosmischer Spiegel ist bereit. Entdecke dein Radix und starte deine erste Voice-Session.
              </p>
              <button
                onClick={() => setShowWelcome(false)}
                className="btn-primary px-6 py-2"
              >
                Los geht's
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-display text-ivory">
          Guten {new Date().getHours() < 12 ? 'Morgen' : new Date().getHours() < 18 ? 'Tag' : 'Abend'}, {profile?.name}
        </h1>
        <p className="text-mist/60 mt-1">
          {new Date().toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
      </header>


      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        <Link
          href="/profile"
          className="card group hover:border-gold/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ✨
            </div>
            <div>
              <h3 className="font-medium text-ivory">Mein Profil</h3>
              <p className="text-xs text-mist/60">
                Astro-Daten & Zeichen
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/agents"
          className="card group hover:border-gold/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-deep/30 to-emerald-deep/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🌟
            </div>
            <div>
              <h3 className="font-medium text-ivory">Astro-Berater</h3>
              <p className="text-xs text-mist/60">
                Li Wei & Astraea
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/voice"
          className="card group hover:border-gold/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🎙️
            </div>
            <div>
              <h3 className="font-medium text-ivory">Voice Agent</h3>
              <p className="text-xs text-mist/60">
                {profile?.voice_minutes_remaining} Min verfügbar
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/chart"
          className="card group hover:border-gold/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ☉
            </div>
            <div>
              <h3 className="font-medium text-ivory">Mein Radix</h3>
              <p className="text-xs text-mist/60">
                {profile?.has_chart ? 'Anzeigen' : 'Berechnen'}
              </p>
            </div>
          </div>
        </Link>
      </section>


      {/* Today's Cosmic Weather */}
      <section className="mb-8">
        <h2 className="text-sm text-mist/60 uppercase tracking-wider mb-4">Kosmisches Wetter</h2>

        <div className="card bg-gradient-to-br from-graphite to-obsidian">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">🌙</div>
            <div>
              <p className="text-ivory font-medium">{insight?.moon_phase}</p>
              <p className="text-sm text-mist/60">Sonne in {insight?.sun_sign}</p>
            </div>
          </div>

          <p className="text-mist/80 mb-4 leading-relaxed">
            {insight?.insight_text}
          </p>

          {/* Top Transits */}
          <div className="space-y-2">
            {insight?.top_transits.map((transit, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-obsidian/50 rounded-lg"
              >
                <div>
                  <p className="text-sm text-ivory">{transit.transit}</p>
                  <p className="text-xs text-mist/50">{transit.theme}</p>
                </div>
                <span className="text-xs text-gold/60">
                  {transit.orb.toFixed(1)}° Orb
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Minutes Widget */}
      <section className="mb-8">
        <div className="card border-gold/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-ivory">Voice-Minuten</h3>
            {profile?.plan === 'free' && (
              <Link href="/pricing" className="text-xs text-gold hover:text-gold-muted">
                Upgrade →
              </Link>
            )}
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="h-3 bg-graphite rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((profile?.voice_minutes_remaining || 0) / (profile?.voice_minutes_total || 1)) * 100}%`
                  }}
                  className="h-full bg-gradient-to-r from-gold to-gold-muted"
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-mist/50 mt-2">
                {profile?.voice_minutes_remaining} von {profile?.voice_minutes_total} Minuten übrig
              </p>
            </div>

            <Link href="/voice" className="btn-primary text-sm py-2 px-4">
              Starten
            </Link>
          </div>
        </div>
      </section>

      {/* Explore */}
      <section>
        <h2 className="text-sm text-mist/60 uppercase tracking-wider mb-4">Entdecken</h2>

        <div className="grid gap-4">
          <Link
            href="/quiz/cosmic-archetype"
            className="card flex items-center gap-4 hover:border-gold/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center text-2xl">
              🔮
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-ivory">Archetyp-Quiz</h3>
              <p className="text-xs text-mist/60">Entdecke deine kosmische Signatur</p>
            </div>
            <span className="text-mist/40">→</span>
          </Link>

          <Link
            href="/whitepaper/placidus"
            className="card flex items-center gap-4 hover:border-gold/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center text-2xl">
              📐
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-ivory">Placidus Whitepaper</h3>
              <p className="text-xs text-mist/60">Die Mathematik hinter dem Häusersystem</p>
            </div>
            <span className="text-mist/40">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}

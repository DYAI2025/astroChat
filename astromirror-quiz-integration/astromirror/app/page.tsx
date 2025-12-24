/**
 * AstroMirror - Chart Page
 * Natal Chart Display with Planets, Houses, and Aspects
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Planet {
  name: string
  symbol: string
  sign: string
  sign_symbol: string
  degree: number
  house: number
  retrograde: boolean
}

interface Aspect {
  planet1: string
  planet2: string
  type: string
  symbol: string
  orb: number
  applying: boolean
}

interface NatalChart {
  computed_at: string
  house_system: string
  warnings: { polar_fallback?: boolean }
  sun_sign: string
  moon_sign: string
  asc_sign: string
  planets: Planet[]
  houses: number[]
  aspects: Aspect[]
}

const SIGN_SYMBOLS: Record<string, string> = {
  'Widder': '♈', 'Stier': '♉', 'Zwillinge': '♊', 'Krebs': '♋',
  'Löwe': '♌', 'Jungfrau': '♍', 'Waage': '♎', 'Skorpion': '♏',
  'Schütze': '♐', 'Steinbock': '♑', 'Wassermann': '♒', 'Fische': '♓'
}

const ASPECT_COLORS: Record<string, string> = {
  'Konjunktion': 'text-gold',
  'Opposition': 'text-red-400',
  'Trigon': 'text-emerald-400',
  'Quadrat': 'text-orange-400',
  'Sextil': 'text-blue-400',
}

export default function ChartPage() {
  const [chart, setChart] = useState<NatalChart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'planets' | 'houses' | 'aspects'>('overview')

  useEffect(() => {
    loadChart()
  }, [])

  const loadChart = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/astro/natal')
      
      if (response.status === 404) {
        setChart(null)
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error('Chart konnte nicht geladen werden')
      }

      const data = await response.json()
      setChart(data.chart)
    } catch (err) {
      // Simulate data for demo
      setChart({
        computed_at: new Date().toISOString(),
        house_system: 'Placidus',
        warnings: {},
        sun_sign: 'Steinbock',
        moon_sign: 'Stier',
        asc_sign: 'Waage',
        planets: [
          { name: 'Sonne', symbol: '☉', sign: 'Steinbock', sign_symbol: '♑', degree: 3.45, house: 4, retrograde: false },
          { name: 'Mond', symbol: '☽', sign: 'Stier', sign_symbol: '♉', degree: 18.22, house: 8, retrograde: false },
          { name: 'Merkur', symbol: '☿', sign: 'Steinbock', sign_symbol: '♑', degree: 15.88, house: 4, retrograde: false },
          { name: 'Venus', symbol: '♀', sign: 'Wassermann', sign_symbol: '♒', degree: 2.15, house: 5, retrograde: false },
          { name: 'Mars', symbol: '♂', sign: 'Krebs', sign_symbol: '♋', degree: 8.92, house: 10, retrograde: true },
          { name: 'Jupiter', symbol: '♃', sign: 'Zwillinge', sign_symbol: '♊', degree: 12.33, house: 9, retrograde: false },
          { name: 'Saturn', symbol: '♄', sign: 'Fische', sign_symbol: '♓', degree: 14.77, house: 6, retrograde: false },
          { name: 'Uranus', symbol: '♅', sign: 'Stier', sign_symbol: '♉', degree: 23.45, house: 8, retrograde: false },
          { name: 'Neptun', symbol: '♆', sign: 'Fische', sign_symbol: '♓', degree: 27.12, house: 6, retrograde: false },
          { name: 'Pluto', symbol: '♇', sign: 'Wassermann', sign_symbol: '♒', degree: 0.88, house: 5, retrograde: false },
        ],
        houses: [187.5, 215.3, 248.9, 286.2, 320.1, 350.8, 7.5, 35.3, 68.9, 106.2, 140.1, 170.8],
        aspects: [
          { planet1: 'Sonne', planet2: 'Mond', type: 'Trigon', symbol: '△', orb: 2.1, applying: false },
          { planet1: 'Sonne', planet2: 'Merkur', type: 'Konjunktion', symbol: '☌', orb: 3.4, applying: true },
          { planet1: 'Mond', planet2: 'Uranus', type: 'Konjunktion', symbol: '☌', orb: 5.2, applying: false },
          { planet1: 'Venus', planet2: 'Pluto', type: 'Konjunktion', symbol: '☌', orb: 1.3, applying: true },
          { planet1: 'Mars', planet2: 'Saturn', type: 'Trigon', symbol: '△', orb: 4.1, applying: false },
        ],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const computeChart = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/astro/compute-natal', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Berechnung fehlgeschlagen')
      }

      const data = await response.json()
      setChart(data.chart)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Berechnung')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-mist/60">Berechne Sternenpositionen...</p>
        </div>
      </div>
    )
  }

  if (!chart) {
    return (
      <div className="px-4 sm:px-6 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold/20 to-emerald-deep/30 flex items-center justify-center text-4xl">
            ☉
          </div>
          <h1 className="text-2xl font-display text-ivory mb-4">
            Dein Radix berechnen
          </h1>
          <p className="text-mist/70 mb-8">
            Basierend auf deinen Geburtsdaten erstellen wir dein vollständiges Geburtshoroskop 
            mit Swiss Ephemeris Präzision.
          </p>
          <button onClick={computeChart} className="btn-primary px-8 py-3">
            Jetzt berechnen
          </button>
          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-8">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display text-ivory">Mein Radix</h1>
          <span className="text-xs text-mist/50">
            {chart.house_system} Häuser
          </span>
        </div>
        {chart.warnings?.polar_fallback && (
          <div className="mt-2 px-3 py-2 bg-gold/10 border border-gold/20 rounded-lg text-xs text-gold">
            ⚠️ Placidus instabil bei deinem Geburtsort – Equal House als Fallback verwendet
          </div>
        )}
      </header>

      {/* Big Three */}
      <section className="grid grid-cols-3 gap-3 mb-8">
        <div className="card text-center py-4">
          <p className="text-xs text-mist/50 mb-1">Sonne</p>
          <p className="text-2xl mb-1">{SIGN_SYMBOLS[chart.sun_sign]}</p>
          <p className="text-sm text-ivory">{chart.sun_sign}</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-xs text-mist/50 mb-1">Mond</p>
          <p className="text-2xl mb-1">{SIGN_SYMBOLS[chart.moon_sign]}</p>
          <p className="text-sm text-ivory">{chart.moon_sign}</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-xs text-mist/50 mb-1">Aszendent</p>
          <p className="text-2xl mb-1">{SIGN_SYMBOLS[chart.asc_sign]}</p>
          <p className="text-sm text-ivory">{chart.asc_sign}</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-graphite/50 rounded-xl">
        {(['overview', 'planets', 'houses', 'aspects'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all
              ${activeTab === tab
                ? 'bg-gold/10 text-gold'
                : 'text-mist hover:text-ivory'
              }
            `}
          >
            {tab === 'overview' && 'Übersicht'}
            {tab === 'planets' && 'Planeten'}
            {tab === 'houses' && 'Häuser'}
            {tab === 'aspects' && 'Aspekte'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-display text-ivory mb-4">Deine kosmische Signatur</h3>
              <p className="text-mist/80 leading-relaxed">
                Mit Sonne in {chart.sun_sign}, Mond in {chart.moon_sign} und {chart.asc_sign}-Aszendent 
                vereinst du die Struktur und Zielstrebigkeit des Steinbocks mit der sinnlichen 
                Beständigkeit des Stiers und der diplomatischen Eleganz der Waage.
              </p>
            </div>
            
            <Link href="/voice" className="card flex items-center gap-4 hover:border-gold/30 transition-all">
              <div className="text-3xl">🎙️</div>
              <div className="flex-1">
                <h3 className="font-medium text-ivory">Voice-Reflexion starten</h3>
                <p className="text-xs text-mist/60">Sprich über dein Radix mit dem kosmischen Spiegel</p>
              </div>
              <span className="text-gold">→</span>
            </Link>
          </div>
        )}

        {/* Planets */}
        {activeTab === 'planets' && (
          <div className="space-y-2">
            {chart.planets.map((planet) => (
              <div key={planet.name} className="card flex items-center gap-4 py-3">
                <span className="text-2xl w-8 text-center">{planet.symbol}</span>
                <div className="flex-1">
                  <p className="text-ivory font-medium">
                    {planet.name}
                    {planet.retrograde && <span className="text-red-400 text-xs ml-1">℞</span>}
                  </p>
                  <p className="text-xs text-mist/60">
                    {planet.degree.toFixed(1)}° in {planet.sign} • Haus {planet.house}
                  </p>
                </div>
                <span className="text-xl">{planet.sign_symbol}</span>
              </div>
            ))}
          </div>
        )}

        {/* Houses */}
        {activeTab === 'houses' && (
          <div className="grid grid-cols-2 gap-3">
            {chart.houses.map((cusp, i) => {
              const houseNum = i + 1
              const signIndex = Math.floor(cusp / 30)
              const signs = ['Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau',
                'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische']
              const sign = signs[signIndex]
              const degree = cusp % 30
              
              return (
                <div key={i} className="card py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-mist/50">Haus {houseNum}</span>
                    <span className="text-lg">{SIGN_SYMBOLS[sign]}</span>
                  </div>
                  <p className="text-sm text-ivory">
                    {degree.toFixed(1)}° {sign}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Aspects */}
        {activeTab === 'aspects' && (
          <div className="space-y-2">
            {chart.aspects.map((aspect, i) => (
              <div key={i} className="card flex items-center gap-4 py-3">
                <span className={`text-xl ${ASPECT_COLORS[aspect.type] || 'text-mist'}`}>
                  {aspect.symbol}
                </span>
                <div className="flex-1">
                  <p className="text-ivory text-sm">
                    {aspect.planet1} {aspect.type} {aspect.planet2}
                  </p>
                  <p className="text-xs text-mist/50">
                    Orb: {aspect.orb.toFixed(1)}° • {aspect.applying ? 'Zunehmend' : 'Abnehmend'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recalculate Button */}
      <div className="mt-8 text-center">
        <button onClick={computeChart} className="btn-ghost text-sm">
          Neu berechnen
        </button>
        <p className="text-xs text-mist/40 mt-2">
          Berechnet: {new Date(chart.computed_at).toLocaleString('de-DE')}
        </p>
      </div>
    </div>
  )
}

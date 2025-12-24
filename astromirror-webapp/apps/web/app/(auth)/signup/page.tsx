/**
 * AstroMirror - Signup Page with Birth Data Onboarding
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 'account' | 'birthdata' | 'consent'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'free'
  
  const [step, setStep] = useState<Step>('account')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Account data
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  // Birth data
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [birthLat, setBirthLat] = useState<number | null>(null)
  const [birthLon, setBirthLon] = useState<number | null>(null)

  // Consent
  const [consentData, setConsentData] = useState(false)
  const [consentTerms, setConsentTerms] = useState(false)

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben')
      return
    }
    
    setStep('birthdata')
  }

  const handleBirthdataSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Simple geocoding simulation - in production, use a real geocoding API
    // For now, we'll just set Berlin as default if no coords
    if (!birthLat || !birthLon) {
      // In production: Call geocoding API here
      setBirthLat(52.52)
      setBirthLon(13.405)
    }
    
    setStep('consent')
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!consentData || !consentTerms) {
      setError('Bitte stimme den Bedingungen zu')
      return
    }

    setIsLoading(true)

    try {
      // Create account
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          plan,
        }),
      })

      if (!signupResponse.ok) {
        const data = await signupResponse.json()
        throw new Error(data.message || 'Registrierung fehlgeschlagen')
      }

      // Save birth data
      const birthResponse = await fetch('/api/user/birth-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birth_date: birthDate,
          birth_time: birthTime,
          birth_place: birthPlace,
          lat: birthLat,
          lon: birthLon,
          consent_version: '1.0',
        }),
      })

      if (!birthResponse.ok) {
        console.warn('Birth data save failed, continuing...')
      }

      // Redirect to dashboard
      router.push('/dashboard?welcome=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-emerald-deep/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-display text-gradient-gold">
            AstroMirror
          </Link>
          <h1 className="mt-4 text-xl text-ivory">Dein kosmischer Spiegel erwartet dich</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['account', 'birthdata', 'consent'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? 'bg-gold text-obsidian'
                    : i < ['account', 'birthdata', 'consent'].indexOf(step)
                    ? 'bg-gold/30 text-gold'
                    : 'bg-graphite text-mist/50'
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="w-8 h-0.5 bg-graphite" />}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="card">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Step 1: Account */}
            {step === 'account' && (
              <motion.form
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleAccountSubmit}
                className="space-y-5"
              >
                <h2 className="text-lg font-display text-ivory mb-4">Konto erstellen</h2>
                
                <div>
                  <label className="block text-sm text-mist/80 mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-graphite border border-gold/20 rounded-xl text-ivory placeholder-mist/40 focus:outline-none focus:border-gold/50"
                    placeholder="Dein Name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-mist/80 mb-2">E-Mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-graphite border border-gold/20 rounded-xl text-ivory placeholder-mist/40 focus:outline-none focus:border-gold/50"
                    placeholder="name@beispiel.de"
                  />
                </div>

                <div>
                  <label className="block text-sm text-mist/80 mb-2">Passwort</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-graphite border border-gold/20 rounded-xl text-ivory placeholder-mist/40 focus:outline-none focus:border-gold/50"
                    placeholder="Mindestens 8 Zeichen"
                  />
                </div>

                <button type="submit" className="btn-primary w-full py-3">
                  Weiter
                </button>
              </motion.form>
            )}

            {/* Step 2: Birth Data */}
            {step === 'birthdata' && (
              <motion.form
                key="birthdata"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleBirthdataSubmit}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-lg font-display text-ivory mb-1">Geburtsdaten</h2>
                  <p className="text-sm text-mist/60">Für präzise astrologische Berechnungen</p>
                </div>
                
                <div>
                  <label className="block text-sm text-mist/80 mb-2">Geburtsdatum</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-graphite border border-gold/20 rounded-xl text-ivory focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-mist/80 mb-2">
                    Geburtszeit <span className="text-mist/40">(so genau wie möglich)</span>
                  </label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-graphite border border-gold/20 rounded-xl text-ivory focus:outline-none focus:border-gold/50"
                  />
                  <p className="mt-1 text-xs text-mist/40">
                    Tipp: Geburtsurkunde oder Eltern fragen
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-mist/80 mb-2">Geburtsort</label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-graphite border border-gold/20 rounded-xl text-ivory placeholder-mist/40 focus:outline-none focus:border-gold/50"
                    placeholder="Stadt, Land"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('account')}
                    className="btn-ghost flex-1 py-3"
                  >
                    Zurück
                  </button>
                  <button type="submit" className="btn-primary flex-1 py-3">
                    Weiter
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Consent */}
            {step === 'consent' && (
              <motion.form
                key="consent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleFinalSubmit}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-lg font-display text-ivory mb-1">Fast geschafft</h2>
                  <p className="text-sm text-mist/60">Noch deine Zustimmung</p>
                </div>

                <div className="space-y-4 p-4 bg-graphite/50 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentData}
                      onChange={(e) => setConsentData(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded bg-graphite border-gold/30"
                    />
                    <span className="text-sm text-mist/80">
                      Ich stimme zu, dass meine Geburtsdaten für astrologische Berechnungen 
                      verarbeitet werden. <Link href="/datenschutz" className="text-gold underline">Datenschutz</Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentTerms}
                      onChange={(e) => setConsentTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded bg-graphite border-gold/30"
                    />
                    <span className="text-sm text-mist/80">
                      Ich akzeptiere die <Link href="/agb" className="text-gold underline">AGB</Link> und 
                      verstehe, dass AstroMirror Reflexion & Unterhaltung bietet – keine Lebensberatung.
                    </span>
                  </label>
                </div>

                <div className="p-4 bg-emerald-deep/10 border border-emerald-accent/20 rounded-xl">
                  <p className="text-sm text-mist/80">
                    🎁 <span className="text-ivory">Du startest mit 3 kostenlosen Voice-Minuten.</span>
                    {plan === 'premium' && ' Premium wird nach Registrierung aktiviert.'}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('birthdata')}
                    className="btn-ghost flex-1 py-3"
                  >
                    Zurück
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !consentData || !consentTerms}
                    className="btn-primary flex-1 py-3 disabled:opacity-50"
                  >
                    {isLoading ? 'Wird erstellt...' : 'Konto erstellen'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-6 border-t border-gold/10 text-center">
            <p className="text-mist/60">
              Bereits registriert?{' '}
              <Link href="/login" className="text-gold hover:text-gold-muted transition-colors">
                Anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

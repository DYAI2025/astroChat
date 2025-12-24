/**
 * AstroMirror - Settings Page
 * User profile, birth data, and subscription management
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserSettings {
  name: string
  email: string
  locale: string
  timezone: string
  birth_date: string
  birth_time: string
  birth_place: string
  plan: 'free' | 'premium'
  plan_status: string
  voice_minutes_monthly: number
  period_end: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthPlace, setBirthPlace] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      // Simulated data - replace with API call
      const data: UserSettings = {
        name: 'Sternenwanderer',
        email: 'user@example.com',
        locale: 'de-DE',
        timezone: 'Europe/Berlin',
        birth_date: '1990-06-15',
        birth_time: '14:30',
        birth_place: 'Berlin, Deutschland',
        plan: 'free',
        plan_status: 'active',
        voice_minutes_monthly: 3,
        period_end: '2025-01-24',
      }
      
      setSettings(data)
      setName(data.name)
      setBirthDate(data.birth_date)
      setBirthTime(data.birth_time)
      setBirthPlace(data.birth_place)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    setIsSaving(true)
    setMessage(null)
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMessage({ type: 'success', text: 'Profil gespeichert' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Speichern fehlgeschlagen' })
    } finally {
      setIsSaving(false)
    }
  }

  const saveBirthData = async () => {
    setIsSaving(true)
    setMessage(null)
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMessage({ type: 'success', text: 'Geburtsdaten aktualisiert. Radix wird neu berechnet.' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Speichern fehlgeschlagen' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-display text-ivory">Einstellungen</h1>
      </header>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <section className="mb-8">
        <h2 className="text-sm text-mist/60 uppercase tracking-wider mb-4">Profil</h2>
        <div className="card space-y-4">
          <div>
            <label className="block text-sm text-mist/80 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-graphite border border-gold/20 rounded-xl text-ivory focus:outline-none focus:border-gold/50"
            />
          </div>
          
          <div>
            <label className="block text-sm text-mist/80 mb-2">E-Mail</label>
            <input
              type="email"
              value={settings?.email}
              disabled
              className="w-full px-4 py-3 bg-graphite/50 border border-gold/10 rounded-xl text-mist cursor-not-allowed"
            />
            <p className="text-xs text-mist/40 mt-1">E-Mail kann nicht geändert werden</p>
          </div>
          
          <button
            onClick={saveProfile}
            disabled={isSaving}
            className="btn-primary py-2.5 w-full sm:w-auto disabled:opacity-50"
          >
            {isSaving ? 'Speichern...' : 'Profil speichern'}
          </button>
        </div>
      </section>

      {/* Birth Data Section */}
      <section className="mb-8">
        <h2 className="text-sm text-mist/60 uppercase tracking-wider mb-4">Geburtsdaten</h2>
        <div className="card space-y-4">
          <div className="p-3 bg-gold/5 border border-gold/10 rounded-lg text-xs text-mist/70">
            ⚠️ Änderungen an Geburtsdaten erfordern eine Neuberechnung des Radix.
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-mist/80 mb-2">Geburtsdatum</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 bg-graphite border border-gold/20 rounded-xl text-ivory focus:outline-none focus:border-gold/50"
              />
            </div>
            
            <div>
              <label className="block text-sm text-mist/80 mb-2">Geburtszeit</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 bg-graphite border border-gold/20 rounded-xl text-ivory focus:outline-none focus:border-gold/50"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-mist/80 mb-2">Geburtsort</label>
            <input
              type="text"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              className="w-full px-4 py-3 bg-graphite border border-gold/20 rounded-xl text-ivory focus:outline-none focus:border-gold/50"
            />
          </div>
          
          <button
            onClick={saveBirthData}
            disabled={isSaving}
            className="btn-ghost py-2.5 w-full sm:w-auto border-gold/30 disabled:opacity-50"
          >
            {isSaving ? 'Speichern...' : 'Geburtsdaten aktualisieren'}
          </button>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="mb-8">
        <h2 className="text-sm text-mist/60 uppercase tracking-wider mb-4">Abonnement</h2>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-ivory font-medium">
                {settings?.plan === 'premium' ? 'Premium' : 'Free'}
              </p>
              <p className="text-xs text-mist/60">
                {settings?.voice_minutes_monthly} Voice-Minuten/Monat
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs ${
              settings?.plan === 'premium' 
                ? 'bg-gold/10 text-gold' 
                : 'bg-graphite text-mist'
            }`}>
              {settings?.plan_status}
            </span>
          </div>
          
          {settings?.plan === 'free' ? (
            <Link href="/pricing" className="btn-primary w-full text-center py-2.5">
              Auf Premium upgraden
            </Link>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-mist/60">
                Nächste Abrechnung: {settings?.period_end}
              </p>
              <button className="btn-ghost text-sm py-2 w-full">
                Abo verwalten
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Data & Privacy */}
      <section className="mb-8">
        <h2 className="text-sm text-mist/60 uppercase tracking-wider mb-4">Daten & Privatsphäre</h2>
        <div className="card space-y-4">
          <Link
            href="/api/user/export"
            className="flex items-center justify-between py-2 text-mist hover:text-ivory transition-colors"
          >
            <span>Meine Daten exportieren</span>
            <span>→</span>
          </Link>
          
          <div className="border-t border-gold/10 pt-4">
            <button className="text-sm text-red-400 hover:text-red-300 transition-colors">
              Konto löschen
            </button>
            <p className="text-xs text-mist/40 mt-1">
              Alle Daten werden unwiderruflich gelöscht
            </p>
          </div>
        </div>
      </section>

      {/* Logout */}
      <section>
        <button
          onClick={handleLogout}
          className="btn-ghost w-full py-3 border-red-500/20 text-red-400 hover:bg-red-500/10"
        >
          Abmelden
        </button>
      </section>

      {/* Legal Links */}
      <footer className="mt-12 pt-8 border-t border-gold/10 text-center">
        <div className="flex items-center justify-center gap-6 text-xs text-mist/50">
          <Link href="/impressum" className="hover:text-ivory transition-colors">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-ivory transition-colors">Datenschutz</Link>
          <Link href="/agb" className="hover:text-ivory transition-colors">AGB</Link>
        </div>
        <p className="mt-4 text-xs text-mist/30">
          AstroMirror v1.0.0
        </p>
      </footer>
    </div>
  )
}

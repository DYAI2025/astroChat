/**
 * AstroMirror - Personal Astro Profile Page
 * Displays user's astrological data: Western, Chinese, Elements
 */
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { AstroProfile, ProfileSection } from '@/types/profile'

// Mock data for demonstration - in production, fetch from API
const mockProfile: AstroProfile = {
    western: {
        sunSign: 'Steinbock',
        moonSign: 'Krebs',
        ascendant: 'Skorpion',
        descendant: 'Stier',
        midheaven: 'Löwe',
        imumCoeli: 'Wassermann',
        planets: [
            { planet: 'Sonne', sign: 'Steinbock', degree: 15.5, house: 3, isRetrograde: false },
            { planet: 'Mond', sign: 'Krebs', degree: 8.2, house: 9, isRetrograde: false },
            { planet: 'Merkur', sign: 'Steinbock', degree: 22.1, house: 3, isRetrograde: false },
            { planet: 'Venus', sign: 'Wassermann', degree: 4.7, house: 4, isRetrograde: false },
            { planet: 'Mars', sign: 'Widder', degree: 18.3, house: 6, isRetrograde: false },
        ]
    },
    chinese: {
        zodiacAnimal: 'Drache',
        element: 'Holz',
        yinYang: 'Yang',
        luckyNumbers: [1, 6, 7],
        luckyColors: ['Gold', 'Silber', 'Weiß']
    },
    combined: {
        moonPhaseAtBirth: 'Vollmond',
        dominantElement: 'Erde',
        dominantModality: 'Kardinal',
        personalityArchetype: 'Der Visionär'
    },
    createdAt: '2024-01-15',
    lastUpdated: '2024-12-25'
}

// Profile sections configuration
const PROFILE_SECTIONS: ProfileSection[] = [
    {
        id: 'sun-sign',
        title: 'Sternzeichen',
        icon: '☉',
        description: 'Dein westliches Sonnenzeichen',
        href: '/profile/chart',
        isUnlocked: true,
        accentColor: '#D4AF37'
    },
    {
        id: 'chinese-zodiac',
        title: 'Chinesisches Tierkreiszeichen',
        icon: '🐉',
        description: 'Dein chinesisches Tierkreiszeichen',
        href: '/profile/chinese',
        isUnlocked: true,
        accentColor: '#0F3D2E'
    },
    {
        id: 'ascendant',
        title: 'Aszendent & Deszendent',
        icon: '⚖️',
        description: 'Die Achsen deiner Identität',
        href: '/profile/chart',
        isUnlocked: true,
        accentColor: '#60a5fa'
    },
    {
        id: 'elements',
        title: 'Elemente & Modalitäten',
        icon: '🌊',
        description: 'Deine elementare Balance',
        href: '/profile/elements',
        isUnlocked: true,
        accentColor: '#10b981'
    },
    {
        id: 'moon-phase',
        title: 'Mondphase bei Geburt',
        icon: '🌕',
        description: 'Der Mond zum Zeitpunkt deiner Geburt',
        href: '/profile/elements',
        isUnlocked: true,
        accentColor: '#94a3b8'
    },
    {
        id: 'planets',
        title: 'Planetenpositionen',
        icon: '🪐',
        description: 'Alle Planeten in deinem Chart',
        href: '/chart',
        isUnlocked: true,
        accentColor: '#f59e0b'
    }
]

// Zodiac sign icons mapping
const ZODIAC_ICONS: Record<string, string> = {
    'Widder': '♈', 'Stier': '♉', 'Zwillinge': '♊', 'Krebs': '♋',
    'Löwe': '♌', 'Jungfrau': '♍', 'Waage': '♎', 'Skorpion': '♏',
    'Schütze': '♐', 'Steinbock': '♑', 'Wassermann': '♒', 'Fische': '♓'
}

// Chinese zodiac icons
const CHINESE_ZODIAC_ICONS: Record<string, string> = {
    'Ratte': '🐀', 'Büffel': '🐂', 'Tiger': '🐅', 'Hase': '🐇',
    'Drache': '🐉', 'Schlange': '🐍', 'Pferd': '🐎', 'Ziege': '🐐',
    'Affe': '🐵', 'Hahn': '🐓', 'Hund': '🐕', 'Schwein': '🐷'
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<AstroProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasData, setHasData] = useState(true)

    useEffect(() => {
        // Simulate loading profile data
        const loadProfile = async () => {
            setIsLoading(true)
            try {
                // In production, fetch from API
                await new Promise(resolve => setTimeout(resolve, 800))
                setProfile(mockProfile)
                setHasData(true)
            } catch (error) {
                console.error('Failed to load profile:', error)
                setHasData(false)
            } finally {
                setIsLoading(false)
            }
        }
        loadProfile()
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner w-8 h-8 mx-auto mb-4" />
                    <p className="text-mist/60">Lade dein kosmisches Profil...</p>
                </div>
            </div>
        )
    }

    // No astro data yet - show onboarding prompt
    if (!hasData || !profile) {
        return (
            <div className="px-4 sm:px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl mx-auto text-center"
                >
                    <div className="text-6xl mb-6">🌟</div>
                    <h1 className="text-3xl font-display text-ivory mb-4">
                        Dein kosmisches Profil wartet
                    </h1>
                    <p className="text-mist/70 mb-8 font-serif-text">
                        Gib deine Geburtsdaten ein, um dein vollständiges
                        astrologisches Profil zu erstellen.
                    </p>
                    <Link href="/settings" className="btn-primary">
                        Geburtsdaten eingeben
                    </Link>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="px-4 sm:px-6 py-8">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-block px-4 py-1.5 mb-4 border border-gold/30 rounded-full text-xs tracking-[0.3em] uppercase text-gold/70">
                    Persönlicher Bereich
                </div>
                <h1 className="text-3xl md:text-4xl font-display text-ivory mb-2">
                    Dein <span className="text-gradient-gold">Astro-Profil</span>
                </h1>
                <p className="text-mist/60">
                    Aktualisiert am {new Date(profile.lastUpdated).toLocaleDateString('de-DE')}
                </p>
            </motion.header>

            {/* Main Astro Wappen (Crest) */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-md mx-auto mb-12"
            >
                <div className="card text-center border-gold/30 bg-gradient-to-br from-graphite via-obsidian to-graphite">
                    {/* Main Signs Display */}
                    <div className="flex items-center justify-center gap-8 mb-6">
                        {/* Sun Sign */}
                        <div className="text-center">
                            <div className="text-5xl mb-2">{ZODIAC_ICONS[profile.western.sunSign]}</div>
                            <p className="text-xs uppercase tracking-wider text-mist/50">Sonne</p>
                            <p className="text-lg font-display text-gold">{profile.western.sunSign}</p>
                        </div>

                        {/* Divider */}
                        <div className="h-16 w-[1px] bg-gold/20" />

                        {/* Chinese Zodiac */}
                        <div className="text-center">
                            <div className="text-5xl mb-2">{CHINESE_ZODIAC_ICONS[profile.chinese.zodiacAnimal]}</div>
                            <p className="text-xs uppercase tracking-wider text-mist/50">Chinesisch</p>
                            <p className="text-lg font-display text-emerald-deep" style={{ color: '#10b981' }}>
                                {profile.chinese.element}-{profile.chinese.zodiacAnimal}
                            </p>
                        </div>
                    </div>

                    {/* Secondary Info */}
                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gold/10">
                        <div className="text-center">
                            <p className="text-xs text-mist/40 uppercase">Aszendent</p>
                            <p className="text-sm text-ivory">{ZODIAC_ICONS[profile.western.ascendant]} {profile.western.ascendant}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-mist/40 uppercase">Mond</p>
                            <p className="text-sm text-ivory">{ZODIAC_ICONS[profile.western.moonSign]} {profile.western.moonSign}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-mist/40 uppercase">Mondphase</p>
                            <p className="text-sm text-ivory">🌕 {profile.combined.moonPhaseAtBirth}</p>
                        </div>
                    </div>

                    {/* Archetype */}
                    <div className="mt-4">
                        <p className="text-xs text-mist/40 uppercase tracking-widest mb-1">Archetyp</p>
                        <p className="text-xl font-display text-gradient-gold">{profile.combined.personalityArchetype}</p>
                    </div>

                    {/* CTA */}
                    <Link
                        href="/chart"
                        className="btn-primary mt-6 w-full pulse-gold"
                    >
                        Vollständiges Chart ansehen
                    </Link>
                </div>
            </motion.section>

            {/* Profile Sections Grid */}
            <section className="mb-12">
                <h2 className="text-lg font-display text-ivory mb-6 px-2">Deine Astro-Bereiche</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {PROFILE_SECTIONS.map((section, index) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                        >
                            <Link
                                href={section.href}
                                className={`card block h-full hover:border-gold/30 transition-all duration-300 ${!section.isUnlocked ? 'opacity-50 pointer-events-none' : ''
                                    }`}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3"
                                    style={{ backgroundColor: `${section.accentColor}20` }}
                                >
                                    {section.icon}
                                </div>
                                <h3 className="font-medium text-ivory text-sm mb-1">{section.title}</h3>
                                <p className="text-xs text-mist/50">{section.description}</p>

                                {!section.isUnlocked && (
                                    <span className="inline-block mt-2 text-xs text-gold/60">🔒 Freischalten</span>
                                )}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Quick Stats */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-12"
            >
                <h2 className="text-lg font-display text-ivory mb-6 px-2">Elementare Balance</h2>
                <div className="card">
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { name: 'Feuer', icon: '🔥', color: '#f59e0b', value: 25 },
                            { name: 'Erde', icon: '⛰️', color: '#78350f', value: 35 },
                            { name: 'Luft', icon: '💨', color: '#94a3b8', value: 20 },
                            { name: 'Wasser', icon: '🌊', color: '#3b82f6', value: 20 },
                        ].map((element) => (
                            <div key={element.name} className="text-center">
                                <div className="text-2xl mb-2">{element.icon}</div>
                                <p className="text-xs text-mist/50 mb-2">{element.name}</p>
                                <div className="h-20 bg-obsidian rounded-lg overflow-hidden relative">
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 rounded-lg"
                                        style={{ backgroundColor: element.color }}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${element.value}%` }}
                                        transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
                                    />
                                </div>
                                <p className="text-sm font-medium text-ivory mt-2">{element.value}%</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Astro Agents CTA */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-8"
            >
                <Link href="/agents" className="card block hover:border-gold/30 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-emerald-deep/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            🌟
                        </div>
                        <div className="flex-1">
                            <h3 className="font-display text-ivory mb-1">Individuelle Astro-Beratung</h3>
                            <p className="text-sm text-mist/60">
                                Sprich mit Li Wei oder Astraea über dein Chart
                            </p>
                        </div>
                        <span className="text-gold group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                </Link>
            </motion.section>

            {/* Chinese Zodiac Details */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <h2 className="text-lg font-display text-ivory mb-6 px-2">Chinesisches Horoskop</h2>
                <div className="card bg-gradient-to-br from-emerald-deep/20 to-obsidian">
                    <div className="flex items-start gap-6">
                        <div className="text-6xl">{CHINESE_ZODIAC_ICONS[profile.chinese.zodiacAnimal]}</div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-display text-ivory mb-2">
                                {profile.chinese.element}-{profile.chinese.zodiacAnimal}
                            </h3>
                            <p className="text-mist/70 font-serif-text mb-4">
                                Als {profile.chinese.yinYang}-{profile.chinese.zodiacAnimal} im Element {profile.chinese.element}
                                verbindest du natürliche Führungsqualitäten mit kreativer Energie.
                            </p>

                            <div className="flex gap-4">
                                <div>
                                    <p className="text-xs text-mist/40 uppercase">Glückszahlen</p>
                                    <p className="text-ivory">{profile.chinese.luckyNumbers?.join(', ')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-mist/40 uppercase">Glücksfarben</p>
                                    <p className="text-ivory">{profile.chinese.luckyColors?.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>
        </div>
    )
}

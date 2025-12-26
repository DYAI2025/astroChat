/**
 * AstroMirror - Astro Agents Overview Page
 * "Individuelle Astro Beratung" section
 */
'use client'

import { motion } from 'framer-motion'
import { ASTRO_AGENTS } from '@/lib/agents-data'
import { AgentCard } from './components'

export default function AstroAgentsPage() {
    return (
        <div className="px-4 sm:px-6 py-8">
            {/* Hero Section */}
            <motion.header
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Badge */}
                <div className="inline-block px-4 py-1.5 mb-6 border border-gold/30 rounded-full text-xs tracking-[0.3em] uppercase text-gold/70">
                    Individuelle Astro Beratung
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-ivory tracking-wide mb-6">
                    Persönliche{' '}
                    <span className="text-gradient-gold">Astro-Agenten</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg text-mist/70 font-serif-text leading-relaxed">
                    Unsere KI-gestützten Berater verbinden uralte Weisheitstraditionen mit
                    modernem Coaching. Wähle deinen kosmischen Begleiter.
                </p>

                {/* Ornament */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    <span className="w-16 h-[1px] bg-gradient-to-r from-transparent to-gold/30" />
                    <span className="w-2 h-2 rotate-45 bg-gold/30" />
                    <span className="w-16 h-[1px] bg-gradient-to-l from-transparent to-gold/30" />
                </div>
            </motion.header>

            {/* Philosophy Statement */}
            <motion.section
                className="max-w-3xl mx-auto mb-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <blockquote className="text-xl md:text-2xl font-serif-text italic text-mist/80 leading-relaxed">
                    "Keine Schicksalsfrage, sondern eine{' '}
                    <span className="text-gold">Erfolgsmeldung</span>."
                </blockquote>
                <p className="mt-6 text-mist/50 text-sm max-w-xl mx-auto">
                    Wir betrachten das Geburts-Chart nicht als Schicksal, sondern als Landkarte
                    Ihrer Möglichkeiten. Jede Konstellation ist ein Versprechen, jeder Aspekt
                    ein Werkzeug für Ihre individuelle Meisterschaft.
                </p>
            </motion.section>

            {/* Agents Grid */}
            <section className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {ASTRO_AGENTS.map((agent, index) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            variant="full"
                            index={index}
                        />
                    ))}
                </div>
            </section>

            {/* Traditions Section */}
            <motion.section
                className="mt-24 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
            >
                <h2 className="text-2xl font-display text-center text-ivory mb-8">
                    Vereinte Weisheitstraditionen
                </h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Chinese */}
                    <div className="card text-center hover:border-gold/30 transition-all">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-deep/40 to-emerald-deep/10 flex items-center justify-center text-2xl">
                            ☯️
                        </div>
                        <h3 className="font-display text-ivory mb-2">Chinesische Astrologie</h3>
                        <p className="text-sm text-mist/60">
                            BaZi, Fünf Wandlungsphasen, Kosmische Zyklen
                        </p>
                    </div>

                    {/* Evolutionary */}
                    <div className="card text-center hover:border-gold/30 transition-all">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center text-2xl">
                            ⚛️
                        </div>
                        <h3 className="font-display text-ivory mb-2">Evolutionäre Astrologie</h3>
                        <p className="text-sm text-mist/60">
                            Seelische Evolution, Transite, Potenzial-Architektur
                        </p>
                    </div>

                    {/* Western */}
                    <div className="card text-center hover:border-gold/30 transition-all sm:col-span-2 lg:col-span-1">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-2xl">
                            ☉
                        </div>
                        <h3 className="font-display text-ivory mb-2">Westliche Astrologie</h3>
                        <p className="text-sm text-mist/60">
                            Tierkreis, Häuser, Aspekte, Transite
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
                className="mt-24 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
            >
                <div className="card max-w-2xl mx-auto bg-gradient-to-br from-graphite to-obsidian border-gold/20">
                    <h3 className="text-2xl font-display text-ivory mb-4">
                        Bereit für Ihre kosmische Beratung?
                    </h3>
                    <p className="text-mist/70 mb-6">
                        Wählen Sie einen Agenten und beginnen Sie Ihre Reise zu den Sternen.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#li-wei" className="btn-primary">
                            Li Wei wählen
                        </a>
                        <a href="#astraea" className="btn-secondary">
                            Astraea wählen
                        </a>
                    </div>
                </div>
            </motion.section>

            {/* Footer Statement */}
            <footer className="mt-24 text-center">
                <div className="text-xs tracking-[0.4em] uppercase text-mist/30 mb-4">
                    Ein neues Bewusstsein
                </div>
                <p className="text-sm italic text-mist/50 max-w-xl mx-auto font-serif-text">
                    "Wir geben Ihnen keine Vorhersage über das, was passieren wird.
                    Wir geben Ihnen die Gewissheit darüber, wer Sie bereits sind:
                    Ein Gewinner, dessen wertvollste Anteile wir gemeinsam ans Licht holen."
                </p>
            </footer>
        </div>
    )
}

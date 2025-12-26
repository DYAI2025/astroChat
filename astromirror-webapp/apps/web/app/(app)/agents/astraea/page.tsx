/**
 * AstroMirror - Astraea Agent Profile Page
 * Evolutionary Astrology Consultant with Celestial Schema
 */
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { getAgentById } from '@/lib/agents-data'
import { AudioPlayer, CelestialSchema, KeywordHighlight } from '../components'

export default function AstraeaPage() {
    const agent = getAgentById('astraea')

    if (!agent) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-mist">Agent nicht gefunden</p>
            </div>
        )
    }

    return (
        <div className="px-4 sm:px-6 py-8">
            {/* Back Navigation */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
            >
                <Link
                    href="/agents"
                    className="inline-flex items-center gap-2 text-mist/60 hover:text-gold transition-colors group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    Alle Agenten
                </Link>
            </motion.div>

            {/* Hero Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-24">
                {/* Image Column (Left on Desktop) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-blue-400/20">
                        <Image
                            src={agent.imageUrl}
                            alt={agent.name}
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                    </div>

                    {/* Decorative Circle */}
                    <motion.div
                        className="absolute -top-10 -right-10 w-56 h-56 border border-blue-400/20 rounded-full hidden lg:block"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    />
                </motion.div>

                {/* Content Column */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Subtitle */}
                    <div className="mb-6 flex items-center gap-4">
                        <span
                            className="w-12 h-[1px]"
                            style={{ backgroundColor: agent.accentColor }}
                        />
                        <span
                            className="tracking-[0.3em] text-xs uppercase font-bold"
                            style={{ color: agent.accentColor }}
                        >
                            {agent.subtitle}
                        </span>
                    </div>

                    {/* Name */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-ivory mb-8">
                        {agent.name}
                    </h1>

                    {/* Bio */}
                    <div className="space-y-6 text-lg text-mist/80 font-serif-text leading-relaxed">
                        {agent.bio.map((para, i) => (
                            <motion.p
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                            >
                                <KeywordHighlight
                                    text={para.text}
                                    keywords={para.keywords}
                                    accentColor={agent.accentColor}
                                />
                            </motion.p>
                        ))}
                    </div>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-3 mt-8">
                        {agent.keywords.map((keyword, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="px-4 py-2 text-sm rounded-full border"
                                style={{
                                    borderColor: `${agent.accentColor}30`,
                                    color: agent.accentColor
                                }}
                            >
                                {keyword}
                            </motion.span>
                        ))}
                    </div>

                    {/* Audio Player */}
                    {agent.audioSample && (
                        <motion.div
                            className="mt-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <AudioPlayer
                                audio={agent.audioSample}
                                accentColor={agent.accentColor}
                                variant="dark"
                            />
                        </motion.div>
                    )}
                </motion.div>
            </section>

            {/* Celestial Schema Section */}
            <section className="mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Description */}
                        <div className="space-y-6 order-2 lg:order-1">
                            <h2 className="text-3xl font-display text-ivory">
                                Himmels-Schema der Evolution
                            </h2>
                            <p className="text-mist/70 font-serif-text leading-relaxed">
                                Astraea nutzt die{' '}
                                <span style={{ color: agent.accentColor }} className="font-medium">
                                    kosmische Geometrie
                                </span>
                                , um die Achsen Ihrer Seele zu definieren. Aszendent und Deszendent
                                sind keine Zufälle, sondern mathematisch präzise Kalibrierungen
                                Ihrer individuellen Vollendung.
                            </p>

                            {/* Expertise Areas */}
                            <div className="space-y-4 pt-4">
                                {agent.expertise.map((exp, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                                    >
                                        <span className="text-2xl">{exp.icon}</span>
                                        <div>
                                            <h4 className="font-medium text-ivory">{exp.area}</h4>
                                            <p className="text-sm text-mist/60">{exp.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Schema Visualization */}
                        <div className="order-1 lg:order-2">
                            <CelestialSchema accentColor={agent.accentColor} />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Consultation Style */}
            <section className="mb-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="card max-w-3xl mx-auto text-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.05) 0%, rgba(11, 13, 18, 0.8) 100%)',
                        borderColor: `${agent.accentColor}20`
                    }}
                >
                    <h3 className="text-2xl font-display text-ivory mb-4">
                        Beratungsansatz
                    </h3>
                    <p className="text-lg text-mist/80 font-serif-text mb-6">
                        {agent.consultationStyle.methodology}
                    </p>

                    <div className="flex flex-wrap justify-center gap-3">
                        {agent.consultationStyle.focusAreas.map((area, i) => (
                            <span
                                key={i}
                                className="px-4 py-2 rounded-full text-sm"
                                style={{
                                    backgroundColor: `${agent.accentColor}20`,
                                    color: agent.accentColor
                                }}
                            >
                                {area}
                            </span>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-8">
                        <Link
                            href="/voice"
                            className="btn-primary"
                            style={{ borderColor: agent.accentColor, color: agent.accentColor }}
                        >
                            Beratung starten
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Quote */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16 max-w-2xl mx-auto"
            >
                <div className="text-xs tracking-[0.4em] uppercase text-mist/30 mb-4">
                    Philosophie
                </div>
                <blockquote className="text-xl md:text-2xl font-serif-text italic text-mist/60">
                    &ldquo;{agent.quote}&rdquo;
                </blockquote>
            </motion.section>

            {/* Navigation to other agents */}
            <footer className="text-center">
                <p className="text-mist/40 text-sm mb-4">Weitere Agenten entdecken</p>
                <Link
                    href="/agents/li-wei"
                    className="inline-flex items-center gap-2 text-gold hover:text-gold-bright transition-colors"
                >
                    <span>←</span>
                    Li Wei – Der Bewahrer der Wandlungsphasen
                </Link>
            </footer>
        </div>
    )
}

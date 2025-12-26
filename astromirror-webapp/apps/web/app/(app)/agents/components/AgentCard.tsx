/**
 * AstroMirror - Agent Card Component
 * Displays an astro agent in card format with hover effects
 */
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { AstroAgent } from '@/types/agents'

interface AgentCardProps {
    agent: AstroAgent
    variant?: 'compact' | 'full'
    index?: number
}

export function AgentCard({ agent, variant = 'compact', index = 0 }: AgentCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
        >
            <Link
                href={`/agents/${agent.id}`}
                className="group block card hover:border-gold/30 transition-all duration-500 overflow-hidden"
            >
                {/* Image Container */}
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-6">
                    <Image
                        src={agent.imageUrl}
                        alt={agent.name}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />

                    {/* Gradient Overlay */}
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-60"
                    />

                    {/* Tradition Badge */}
                    <div
                        className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md"
                        style={{
                            backgroundColor: `${agent.accentColor}20`,
                            color: agent.accentColor,
                            border: `1px solid ${agent.accentColor}40`
                        }}
                    >
                        {agent.tradition === 'chinese' ? 'Chinesische Astrologie' :
                            agent.tradition === 'evolutionary' ? 'Evolutionäre Astrologie' :
                                agent.tradition === 'western' ? 'Westliche Astrologie' : 'Vedische Astrologie'}
                    </div>

                    {/* Premium Badge */}
                    {agent.isPremium && (
                        <div className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-bold bg-gold text-obsidian">
                            PREMIUM
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-3">
                    {/* Subtitle Line */}
                    <div className="flex items-center gap-3">
                        <span
                            className="w-10 h-[1px]"
                            style={{ backgroundColor: agent.accentColor }}
                        />
                        <span
                            className="text-xs uppercase tracking-[0.3em] font-medium"
                            style={{ color: agent.accentColor }}
                        >
                            {agent.subtitle}
                        </span>
                    </div>

                    {/* Name */}
                    <h3 className="font-display text-2xl md:text-3xl text-ivory group-hover:text-gold transition-colors">
                        {agent.name}
                    </h3>

                    {/* Short Bio */}
                    {variant === 'full' && (
                        <p className="text-mist/70 font-serif-text leading-relaxed line-clamp-3">
                            {agent.bio[0]?.text}
                        </p>
                    )}

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {agent.keywords.slice(0, 3).map((keyword, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 text-xs rounded-full border border-gold/20 text-mist/60"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="pt-4 flex items-center justify-between text-sm">
                        <span className="text-gold group-hover:text-gold-bright transition-colors">
                            Beratung entdecken →
                        </span>
                        {agent.audioSample && (
                            <span className="text-mist/40 flex items-center gap-1">
                                🎧 Hörprobe
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

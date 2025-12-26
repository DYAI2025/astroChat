/**
 * AstroMirror - BaZi Elements Dashboard
 * Interactive visualization of the Five Elements (Wu Xing)
 */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BAZI_ELEMENTS } from '@/lib/agents-data'

interface BaziDashboardProps {
    className?: string
}

export function BaziDashboard({ className = '' }: BaziDashboardProps) {
    const [activeElement, setActiveElement] = useState<string | null>(null)
    const elements = BAZI_ELEMENTS.elements

    // Calculate positions on a pentagon
    const getPosition = (index: number, total: number, radius: number) => {
        const angle = (index * 360 / total - 90) * (Math.PI / 180)
        return {
            x: 200 + radius * Math.cos(angle),
            y: 200 + radius * Math.sin(angle)
        }
    }

    return (
        <div className={`relative ${className}`}>
            {/* SVG Visualization */}
            <div className="relative w-full max-w-[500px] aspect-square mx-auto">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                    {/* Defs for filters */}
                    <defs>
                        <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background Circle */}
                    <circle
                        cx="200"
                        cy="200"
                        r="150"
                        fill="none"
                        stroke="rgba(212, 175, 55, 0.1)"
                        strokeWidth="1"
                        strokeDasharray="4 8"
                    />
                    <circle
                        cx="200"
                        cy="200"
                        r="100"
                        fill="none"
                        stroke="rgba(212, 175, 55, 0.05)"
                        strokeWidth="1"
                    />

                    {/* Elements */}
                    {elements.map((element, i) => {
                        const pos = getPosition(i, elements.length, 150)
                        const isActive = activeElement === element.name

                        return (
                            <g
                                key={element.name}
                                className="cursor-pointer"
                                onMouseEnter={() => setActiveElement(element.name)}
                                onMouseLeave={() => setActiveElement(null)}
                            >
                                {/* Connection line to center */}
                                <motion.line
                                    x1="200"
                                    y1="200"
                                    x2={pos.x}
                                    y2={pos.y}
                                    stroke={element.color}
                                    strokeWidth="1"
                                    initial={{ opacity: 0.2 }}
                                    animate={{ opacity: isActive ? 0.6 : 0.2 }}
                                />

                                {/* Pulse ring */}
                                <motion.circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r="25"
                                    fill="none"
                                    stroke={element.color}
                                    strokeWidth="1"
                                    initial={{ r: 25, opacity: 0.5 }}
                                    animate={isActive ? {
                                        r: [25, 45],
                                        opacity: [0.5, 0]
                                    } : {}}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: 'easeOut'
                                    }}
                                />

                                {/* Element circle */}
                                <motion.circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r="25"
                                    fill="#0B0D12"
                                    stroke={element.color}
                                    strokeWidth={isActive ? 3 : 2}
                                    filter={isActive ? 'url(#glow-gold)' : undefined}
                                    animate={{
                                        scale: isActive ? 1.15 : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                />

                                {/* Element symbol (text) */}
                                <text
                                    x={pos.x}
                                    y={pos.y}
                                    dy=".35em"
                                    textAnchor="middle"
                                    fill={element.color}
                                    fontSize="12"
                                    fontWeight="bold"
                                    className="pointer-events-none select-none"
                                >
                                    {element.name[0]}
                                </text>

                                {/* Element name label */}
                                <motion.text
                                    x={pos.x}
                                    y={pos.y + 45}
                                    textAnchor="middle"
                                    fill="#CFC7B8"
                                    fontSize="11"
                                    className="pointer-events-none select-none"
                                    initial={{ opacity: 0.6 }}
                                    animate={{ opacity: isActive ? 1 : 0.6 }}
                                >
                                    {element.name}
                                </motion.text>
                            </g>
                        )
                    })}

                    {/* Center Yin-Yang inspired symbol */}
                    <circle cx="200" cy="200" r="20" fill="#0F3D2E" stroke="rgba(212, 175, 55, 0.3)" strokeWidth="1" />
                    <text x="200" y="200" dy=".35em" textAnchor="middle" fill="#D4AF37" fontSize="10" fontWeight="bold">
                        氣
                    </text>
                </svg>
            </div>

            {/* Legend Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
                {elements.map((element) => {
                    const isActive = activeElement === element.name
                    return (
                        <motion.div
                            key={element.name}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${isActive
                                    ? 'bg-graphite border-gold/30'
                                    : 'bg-graphite/50 border-gold/10 hover:border-gold/20'
                                }`}
                            onMouseEnter={() => setActiveElement(element.name)}
                            onMouseLeave={() => setActiveElement(null)}
                            whileHover={{ y: -2 }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                                    style={{ backgroundColor: `${element.color}20` }}
                                >
                                    {element.symbol}
                                </div>
                                <div>
                                    <span
                                        className="text-xs uppercase tracking-widest font-medium"
                                        style={{ color: element.color }}
                                    >
                                        {element.name}
                                    </span>
                                    <p className="text-sm text-ivory/80">{element.power}</p>
                                </div>
                            </div>

                            {/* Percentage bar */}
                            <div className="mt-3 h-1 bg-obsidian rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: element.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${element.percentage}%` }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                />
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

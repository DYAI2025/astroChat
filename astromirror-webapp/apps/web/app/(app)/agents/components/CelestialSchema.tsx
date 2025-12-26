/**
 * AstroMirror - Celestial Schema Visualization
 * Animated ASC/DSC axis with golden ratio circles
 */
'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface CelestialSchemaProps {
    className?: string
    accentColor?: string
}

export function CelestialSchema({ className = '', accentColor = '#60a5fa' }: CelestialSchemaProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative w-full max-w-[500px] aspect-square mx-auto">
                <motion.svg
                    viewBox="0 0 500 500"
                    className="w-full h-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
                    style={{ filter: `drop-shadow(0 0 15px ${accentColor}30)` }}
                >
                    {/* Grid Lines */}
                    <g opacity="0.3">
                        {/* Vertical Axis */}
                        <line
                            x1="250" y1="50" x2="250" y2="450"
                            stroke={accentColor}
                            strokeWidth="0.5"
                            strokeDasharray="2 4"
                        />
                        {/* Horizontal Axis */}
                        <line
                            x1="50" y1="250" x2="450" y2="250"
                            stroke={accentColor}
                            strokeWidth="0.5"
                            strokeDasharray="2 4"
                        />
                    </g>

                    {/* Golden Ratio Circles */}
                    <circle
                        cx="250" cy="250" r="100"
                        fill="none"
                        stroke={accentColor}
                        strokeWidth="0.5"
                        opacity="0.3"
                    />
                    <circle
                        cx="250" cy="250" r="161.8"
                        fill="none"
                        stroke={accentColor}
                        strokeWidth="0.5"
                        opacity="0.3"
                    />
                    <circle
                        cx="250" cy="250" r="61.8"
                        fill="none"
                        stroke={accentColor}
                        strokeWidth="0.3"
                        opacity="0.2"
                    />

                    {/* ASC/DSC Axis - Animated */}
                    <motion.g
                        animate={{ rotate: [0, 15, 0, -15, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ transformOrigin: '250px 250px' }}
                    >
                        <line
                            x1="100" y1="250" x2="400" y2="250"
                            stroke={accentColor}
                            strokeWidth="2"
                        />

                        {/* ASC Point */}
                        <circle cx="100" cy="250" r="6" fill={accentColor} />
                        <text
                            x="70" y="255"
                            fill="white"
                            fontSize="14"
                            fontFamily="serif"
                            fontStyle="italic"
                        >
                            ASC
                        </text>

                        {/* DSC Point */}
                        <circle cx="400" cy="250" r="4" fill={accentColor} opacity="0.7" />
                        <text
                            x="415" y="255"
                            fill="white"
                            fontSize="14"
                            fontFamily="serif"
                            fontStyle="italic"
                        >
                            DSC
                        </text>
                    </motion.g>

                    {/* Star Points */}
                    {[
                        { cx: 300, cy: 150, delay: 0 },
                        { cx: 180, cy: 380, delay: 1 },
                        { cx: 420, cy: 200, delay: 2 },
                        { cx: 150, cy: 150, delay: 1.5 },
                        { cx: 350, cy: 350, delay: 0.5 }
                    ].map((star, i) => (
                        <motion.circle
                            key={i}
                            cx={star.cx}
                            cy={star.cy}
                            r="3"
                            fill="white"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0.2, 1, 0.2],
                                scale: [0.8, 1, 0.8]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: star.delay,
                                ease: 'easeInOut'
                            }}
                        />
                    ))}

                    {/* Golden Spiral (simplified) */}
                    <path
                        d="M250,250 
               a10,10 0 0,1 20,0 
               a15,15 0 0,1 -30,0 
               a20,20 0 0,1 40,0 
               a25,25 0 0,1 -50,0"
                        fill="none"
                        stroke={accentColor}
                        strokeWidth="0.3"
                        opacity="0.4"
                    />
                </motion.svg>
            </div>

            {/* Formula Display */}
            <motion.div
                className="mt-8 p-6 border border-white/5 rounded-xl bg-white/5 backdrop-blur text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                <code className="text-sm md:text-base leading-loose block" style={{ color: `${accentColor}80` }}>
                    Φ = (1 + √5) / 2 ≈ 1.618
                </code>
                <code className="text-sm md:text-base leading-loose block mt-2" style={{ color: `${accentColor}60` }}>
                    ASC = [λs - (α × cos(ε))] / tan(φ)
                </code>
                <code className="text-sm md:text-base leading-loose block mt-2" style={{ color: `${accentColor}40` }}>
                    Evolutionary Vector = f(Success)
                </code>
            </motion.div>

            {/* MC/IC Labels */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-mist/40 font-serif italic">
                MC
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-mist/40 font-serif italic">
                IC
            </div>
        </div>
    )
}

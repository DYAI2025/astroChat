/**
 * AstroMirror - Keyword Highlight Component
 * Highlights keywords in text with hover effects
 */
'use client'

import { motion } from 'framer-motion'

interface KeywordHighlightProps {
    text: string
    keywords?: string[]
    accentColor?: string
}

export function KeywordHighlight({
    text,
    keywords = [],
    accentColor = '#D4AF37'
}: KeywordHighlightProps) {
    if (keywords.length === 0) {
        return <span>{text}</span>
    }

    // Create a regex pattern from keywords
    const pattern = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    const parts = text.split(pattern)

    return (
        <>
            {parts.map((part, index) => {
                const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase())

                if (isKeyword) {
                    return (
                        <motion.span
                            key={index}
                            className="relative inline-block font-medium cursor-default"
                            style={{ color: 'inherit' }}
                            whileHover={{ color: accentColor }}
                        >
                            {part}
                            <motion.span
                                className="absolute bottom-0 left-0 h-[1px] bg-current"
                                initial={{ width: 0 }}
                                whileHover={{ width: '100%' }}
                                transition={{ duration: 0.3 }}
                                style={{ opacity: 0.4 }}
                            />
                        </motion.span>
                    )
                }

                return <span key={index}>{part}</span>
            })}
        </>
    )
}

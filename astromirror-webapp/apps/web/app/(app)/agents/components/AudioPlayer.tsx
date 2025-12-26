/**
 * AstroMirror - Audio Player Component
 * Glassmorphism audio player for agent voice samples
 */
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { AgentAudioSample } from '@/types/agents'

interface AudioPlayerProps {
    audio: AgentAudioSample
    accentColor: string
    variant?: 'light' | 'dark'
}

export function AudioPlayer({ audio, accentColor, variant = 'dark' }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const audioEl = audioRef.current
        if (!audioEl) return

        const handleLoadedMetadata = () => {
            setDuration(audioEl.duration)
            setIsLoaded(true)
        }

        const handleTimeUpdate = () => {
            if (audioEl.duration) {
                setProgress((audioEl.currentTime / audioEl.duration) * 100)
            }
        }

        const handleEnded = () => {
            setIsPlaying(false)
            setProgress(0)
        }

        audioEl.addEventListener('loadedmetadata', handleLoadedMetadata)
        audioEl.addEventListener('timeupdate', handleTimeUpdate)
        audioEl.addEventListener('ended', handleEnded)

        return () => {
            audioEl.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audioEl.removeEventListener('timeupdate', handleTimeUpdate)
            audioEl.removeEventListener('ended', handleEnded)
        }
    }, [])

    const togglePlay = () => {
        const audioEl = audioRef.current
        if (!audioEl) return

        if (isPlaying) {
            audioEl.pause()
        } else {
            audioEl.play()
        }
        setIsPlaying(!isPlaying)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const bgClass = variant === 'dark'
        ? 'bg-white/5 border-white/10'
        : 'bg-graphite/50 border-gold/10'

    return (
        <div className={`p-6 md:p-8 backdrop-blur-xl border rounded-2xl ${bgClass}`}>
            <audio ref={audioRef} src={audio.url} preload="metadata" />

            <div className="flex items-center gap-4 md:gap-6">
                {/* Play Button */}
                <motion.button
                    onClick={togglePlay}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg transition-colors"
                    style={{
                        backgroundColor: accentColor,
                        boxShadow: `0 0 20px ${accentColor}30`
                    }}
                    disabled={!isLoaded}
                >
                    {isPlaying ? (
                        <svg className="w-6 h-6 text-obsidian" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-obsidian ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </motion.button>

                {/* Progress Section */}
                <div className="flex-1">
                    {/* Title */}
                    <div className="text-xs uppercase tracking-widest text-mist/60 mb-2">
                        {audio.title}
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: accentColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                        />
                    </div>

                    {/* Time Display */}
                    <div className="flex justify-between mt-2 text-xs text-mist/40">
                        <span>{formatTime((progress / 100) * duration)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>

            {/* Audio Wave Animation (when playing) */}
            {isPlaying && (
                <div className="flex items-end justify-center gap-1 h-8 mt-4">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 rounded-full"
                            style={{ backgroundColor: accentColor }}
                            animate={{
                                height: [8, 24, 8],
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: 'easeInOut'
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

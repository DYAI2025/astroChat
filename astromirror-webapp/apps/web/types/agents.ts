/**
 * AstroMirror - Astro Agent Types
 * Types for AI astrology consultants
 */

// Agent biography paragraph with optional keyword highlights
export interface AgentBioParagraph {
    text: string
    keywords?: string[]
}

// Agent expertise area
export interface AgentExpertise {
    area: string
    description: string
    icon: string
}

// Audio sample for agent
export interface AgentAudioSample {
    title: string
    url: string
    duration?: number
}

// Agent consultation style
export interface ConsultationStyle {
    approach: string
    focusAreas: string[]
    methodology: string
}

// Complete Astro Agent definition
export interface AstroAgent {
    id: string
    name: string
    subtitle: string
    tradition: 'chinese' | 'western' | 'vedic' | 'evolutionary'

    // Visual
    imageUrl: string
    accentColor: string
    secondaryColor: string

    // Content
    bio: AgentBioParagraph[]
    keywords: string[]
    expertise: AgentExpertise[]
    quote: string

    // Audio
    audioSample?: AgentAudioSample

    // Consultation
    consultationStyle: ConsultationStyle

    // Status
    isAvailable: boolean
    isPremium: boolean
}

// Agent card display props
export interface AgentCardProps {
    agent: AstroAgent
    variant?: 'compact' | 'full'
    showAudio?: boolean
}

// BaZi visualization data for Li Wei
export interface BaZiVisualizationData {
    elements: Array<{
        name: string
        color: string
        power: string
        symbol: string
        percentage: number
    }>
}

// Celestial schema data for Astraea
export interface CelestialSchemaData {
    ascendantDegree: number
    goldenRatioCircles: number[]
    starPoints: Array<{ x: number; y: number }>
}

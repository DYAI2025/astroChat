/**
 * AstroMirror - Astrological Profile Types
 * Complete typings for user's astrological data
 */

// Planet position in a chart
export interface PlanetPosition {
    planet: string
    sign: string
    degree: number
    house: number
    isRetrograde: boolean
}

// Chinese BaZi Pillars
export interface BaZiPillars {
    year: { stem: string; branch: string }
    month: { stem: string; branch: string }
    day: { stem: string; branch: string }
    hour: { stem: string; branch: string }
}

// Western Astrology Data
export interface WesternAstrology {
    sunSign: string
    moonSign: string
    ascendant: string
    descendant: string
    midheaven: string
    imumCoeli: string
    planets: PlanetPosition[]
}

// Chinese Astrology Data
export interface ChineseAstrology {
    zodiacAnimal: string
    element: string
    yinYang: 'Yin' | 'Yang'
    baziPillars?: BaZiPillars
    luckyNumbers?: number[]
    luckyColors?: string[]
}

// Combined Astrology Insights
export interface CombinedInsights {
    moonPhaseAtBirth: string
    dominantElement: string
    dominantModality: 'Kardinal' | 'Fix' | 'Veränderlich'
    personalityArchetype: string
}

// Complete Astrological Profile
export interface AstroProfile {
    western: WesternAstrology
    chinese: ChineseAstrology
    combined: CombinedInsights
    createdAt: string
    lastUpdated: string
}

// Profile display section
export interface ProfileSection {
    id: string
    title: string
    icon: string
    description: string
    href: string
    isUnlocked: boolean
    accentColor?: string
}

// BaZi Element for visualization
export interface BaZiElement {
    name: string
    color: string
    power: string
    symbol: string
    percentage?: number
}

// Moon phase information
export interface MoonPhase {
    name: string
    icon: string
    description: string
    element: string
}

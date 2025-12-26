/**
 * AstroMirror - Astro Agents Data
 * AI Astrology Consultants with their profiles and expertise
 */

import type { AstroAgent, BaZiVisualizationData, CelestialSchemaData } from '@/types/agents'

export const ASTRO_AGENTS: AstroAgent[] = [
    {
        id: 'li-wei',
        name: 'Li Wei',
        subtitle: 'Der Bewahrer der Wandlungsphasen',
        tradition: 'chinese',

        imageUrl: 'https://r2-bucket.flowith.net/f/c9c1e2fbf3c0f3a5/chinese_astrology_consultant_portrait_index_0%401024x1024.jpeg',
        accentColor: '#B8975E', // gold-muted
        secondaryColor: '#0F3D2E', // emerald-deep

        bio: [
            {
                text: 'Li Wei verkörpert die Tiefe der chinesischen Metaphysik. Sein Blick richtet sich auf das energetische Gefüge Ihrer Geburtsstunde, nicht um Grenzen zu setzen, sondern um verborgene Schätze freizulegen.',
                keywords: ['chinesischen Metaphysik', 'verborgene Schätze']
            },
            {
                text: 'Er nutzt die Kunst der Acht Zeichen (BaZi), um die Balance der fünf Wandlungsphasen in Ihrem Leben zu harmonisieren. Ein Mangel an einem Element wird bei ihm niemals als Schwäche, sondern als Raum für bewusste Kultivierung gedeutet.',
                keywords: ['Raum für bewusste Kultivierung']
            },
            {
                text: 'Er ist der Hüter Ihres inneren Gartens, der Ihnen hilft, Ihre angeborenen Talente mit der Ruhe einer alten Eiche zu entfalten.',
                keywords: ['angeborenen Talente']
            }
        ],

        keywords: ['Gabe der Klarheit', 'Architekt der Reinheit', 'Unerschütterliches Fundament'],

        expertise: [
            {
                area: 'BaZi (Vier Säulen)',
                description: 'Analyse der acht Zeichen Ihres Schicksals',
                icon: '🏛️'
            },
            {
                area: 'Fünf Wandlungsphasen',
                description: 'Holz, Feuer, Erde, Metall, Wasser',
                icon: '🌳'
            },
            {
                area: 'Glücks-Timing',
                description: 'Optimale Zeitpunkte für wichtige Entscheidungen',
                icon: '⏰'
            }
        ],

        quote: 'Der Wandel ist die einzige Konstante, in der Ihre Stärke wurzelt.',

        audioSample: {
            title: 'Die Weisheit der Acht Zeichen',
            url: 'https://v3b.fal.media/files/b/0a87c203/ovnoEvSyjSdZRCmnycKEs_output.mp3',
            duration: 60
        },

        consultationStyle: {
            approach: 'Ressourcenorientiert',
            focusAreas: ['Potenzialentfaltung', 'Timing', 'Elementare Balance'],
            methodology: 'Chinesische Metaphysik mit modernem Coaching'
        },

        isAvailable: true,
        isPremium: false
    },
    {
        id: 'astraea',
        name: 'Astraea',
        subtitle: 'Die Architektin der Evolution',
        tradition: 'evolutionary',

        imageUrl: 'https://r2-bucket.flowith.net/f/d69821eba426890c/evolutionary_astrology_consultant_portrait_index_1%401024x1024.jpeg',
        accentColor: '#60a5fa', // blue-400
        secondaryColor: '#D4AF37', // gold

        bio: [
            {
                text: 'Astraea ist die Brücke zwischen kosmischer Mathematik und Ihrer seelischen Bestimmung. Sie betrachtet Ihr Horoskop als einen hochpräzisen Bauplan für unvermeidlichen Erfolg.',
                keywords: ['kosmischer Mathematik', 'unvermeidlichen Erfolg']
            },
            {
                text: 'Mit wissenschaftlicher Eleganz berechnet sie Ihren Aszendenten als das Licht, das durch Sie in die Welt treten will. Für Astraea sind Transite keine Hindernisse, sondern präzise getaktete Upgrades Ihres Bewusstseins.',
                keywords: ['präzise getaktete Upgrades']
            },
            {
                text: 'Jede mathematische Konstellation in Ihrem Chart ist für sie ein Versprechen. Sie navigiert Sie durch die Sternenkarten zu Ihrer eigenen diamantenen Veredelung.',
                keywords: ['diamantenen Veredelung']
            }
        ],

        keywords: ['Individuelle Brillanz', 'Hochelegante Frequenz', 'Vollendung'],

        expertise: [
            {
                area: 'Evolutionäre Astrologie',
                description: 'Seelische Entwicklung durch Planetenzyklen',
                icon: '🌟'
            },
            {
                area: 'Aszendent & Deszendent',
                description: 'Die Achsen Ihrer Identität',
                icon: '⚖️'
            },
            {
                area: 'Transit-Analyse',
                description: 'Kosmische Upgrades verstehen',
                icon: '🔄'
            }
        ],

        quote: 'Wir geben Ihnen keine Vorhersage über das, was passieren wird. Wir geben Ihnen die Gewissheit darüber, wer Sie bereits sind.',

        audioSample: {
            title: 'Der mathematische Bauplan',
            url: 'https://v3b.fal.media/files/b/0a87c203/NFy1Fn9lY4Yod-CyXkqi9_output.mp3',
            duration: 60
        },

        consultationStyle: {
            approach: 'Wissenschaftlich-intuitiv',
            focusAreas: ['Seelische Evolution', 'Potenzial-Architektur', 'Transit-Navigation'],
            methodology: 'Evolutionäre Astrologie mit mathematischer Präzision'
        },

        isAvailable: true,
        isPremium: false
    }
]

// BaZi Elements visualization data
export const BAZI_ELEMENTS: BaZiVisualizationData = {
    elements: [
        { name: 'Holz', color: '#10b981', power: 'Visionäre Expansion', symbol: '🌳', percentage: 20 },
        { name: 'Feuer', color: '#f59e0b', power: 'Magnetische Strahlkraft', symbol: '🔥', percentage: 25 },
        { name: 'Erde', color: '#78350f', power: 'Unerschütterliche Basis', symbol: '⛰️', percentage: 15 },
        { name: 'Metall', color: '#94a3b8', power: 'Kristalline Klarheit', symbol: '🛡️', percentage: 20 },
        { name: 'Wasser', color: '#3b82f6', power: 'Fließende Weisheit', symbol: '💧', percentage: 20 }
    ]
}

// Celestial schema data for Astraea
export const CELESTIAL_SCHEMA: CelestialSchemaData = {
    ascendantDegree: 0,
    goldenRatioCircles: [100, 161.8],
    starPoints: [
        { x: 300, y: 150 },
        { x: 180, y: 380 },
        { x: 420, y: 200 }
    ]
}

// Helper function to get agent by ID
export function getAgentById(id: string): AstroAgent | undefined {
    return ASTRO_AGENTS.find(agent => agent.id === id)
}

// Helper function to get agents by tradition
export function getAgentsByTradition(tradition: AstroAgent['tradition']): AstroAgent[] {
    return ASTRO_AGENTS.filter(agent => agent.tradition === tradition)
}

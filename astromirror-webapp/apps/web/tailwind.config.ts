/**
 * AstroMirror - Tailwind CSS Configuration
 * Design tokens integrated
 */
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Colors
      colors: {
        // Core
        obsidian: '#070708',
        graphite: '#0F1012',
        
        // Gold spectrum
        gold: {
          DEFAULT: '#D4AF37',
          primary: '#D4AF37',
          muted: '#B8975E',
          bright: '#F5E8C7',
          dim: '#8B7355',
        },
        
        // Emerald
        emerald: {
          deep: '#0F3D2E',
          accent: '#1A5C45',
        },
        
        // Text
        ivory: '#F6F0E1',
        mist: '#CFC7B8',
        
        // Borders
        'border-subtle': 'rgba(212, 175, 55, 0.1)',
        'border-gold': 'rgba(212, 175, 55, 0.3)',
      },
      
      // Typography
      fontFamily: {
        display: ['var(--font-cinzel)', 'Cinzel', 'serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      
      // Spacing
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Border radius
      borderRadius: {
        '4xl': '2rem',
      },
      
      // Box shadows
      boxShadow: {
        'gold-glow': '0 0 40px rgba(212, 175, 55, 0.1)',
        'gold-glow-lg': '0 0 60px rgba(212, 175, 55, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.5)',
      },
      
      // Animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      
      // Background images
      backgroundImage: {
        'gold-gradient': 'linear-gradient(90deg, #D4AF37, #B8975E)',
        'gold-gradient-vertical': 'linear-gradient(180deg, #D4AF37, #B8975E)',
        'cosmic-radial': 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.03) 0%, transparent 70%)',
        'emerald-gradient': 'linear-gradient(135deg, #0F3D2E, #1A5C45)',
      },
      
      // Backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      
      // Typography
      typography: {
        DEFAULT: {
          css: {
            color: '#F6F0E1',
            a: {
              color: '#D4AF37',
              '&:hover': {
                color: '#F5E8C7',
              },
            },
            h1: {
              color: '#D4AF37',
              fontFamily: 'var(--font-cinzel), Cinzel, serif',
            },
            h2: {
              color: '#F6F0E1',
              fontFamily: 'var(--font-cinzel), Cinzel, serif',
            },
            h3: {
              color: '#F6F0E1',
              fontFamily: 'var(--font-cinzel), Cinzel, serif',
            },
            strong: {
              color: '#F6F0E1',
            },
            blockquote: {
              color: '#CFC7B8',
              borderLeftColor: '#D4AF37',
            },
            code: {
              color: '#D4AF37',
              backgroundColor: '#0F1012',
            },
            hr: {
              borderColor: 'rgba(212, 175, 55, 0.2)',
            },
          },
        },
      },
    },
  },
  plugins: [
    // These plugins are optional - install with: npm i -D @tailwindcss/typography @tailwindcss/forms
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/forms'),
  ],
}

export default config

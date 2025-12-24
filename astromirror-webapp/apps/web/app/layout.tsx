/**
 * AstroMirror - Root Layout
 * Next.js 14 App Router
 */
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Inter, Cinzel } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AstroMirror – Dein kosmischer Spiegel',
    template: '%s | AstroMirror',
  },
  description:
    'Premium-Astrologie mit Voice-Agent. Tägliche Reflexion durch präzise Radix-Berechnungen und persönliche Transit-Deutungen.',
  keywords: [
    'Astrologie',
    'Horoskop',
    'Geburtshoroskop',
    'Transite',
    'Voice Agent',
    'Premium Astrologie',
  ],
  authors: [{ name: 'AstroMirror' }],
  creator: 'AstroMirror',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://astromirror.io',
    siteName: 'AstroMirror',
    title: 'AstroMirror – Dein kosmischer Spiegel',
    description: 'Premium-Astrologie mit Voice-Agent. Persönlich. Präzise. Spiegelnd.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AstroMirror',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AstroMirror',
    description: 'Dein kosmischer Spiegel',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#070708',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="min-h-screen bg-obsidian text-ivory antialiased">
        {/* Subtle cosmic background */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.03)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(15,61,46,0.05)_0%,transparent_50%)]" />
        </div>
        
        {/* Main content */}
        <main className="relative z-10">
          {children}
        </main>
        
        {/* Disclaimer footer */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 bg-obsidian/90 backdrop-blur-sm border-t border-graphite/30 py-2 px-4">
          <p className="text-center text-xs text-mist/60">
            Zur Reflexion & Unterhaltung. Keine Lebensberatung.
          </p>
        </footer>
        
        {/* ElevenLabs Conversational AI Widget */}
        <Script
          src="https://elevenlabs.io/convai-widget/index.js"
          strategy="afterInteractive"
          async
        />
      </body>
    </html>
  )
}

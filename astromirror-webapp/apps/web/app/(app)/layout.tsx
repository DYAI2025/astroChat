/**
 * AstroMirror - App Layout
 * Navigation shell for authenticated routes
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Übersicht', icon: '◉' },
  { href: '/profile', label: 'Profil', icon: '✨' },
  { href: '/agents', label: 'Berater', icon: '🌟' },
  { href: '/chart', label: 'Radix', icon: '☉' },
  { href: '/voice', label: 'Voice', icon: '🎙️' },
  { href: '/settings', label: 'Einstellungen', icon: '⚙️' },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen pb-20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-obsidian/95 backdrop-blur-xl border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="font-display text-xl text-gradient-gold">
              AstroMirror
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-gold/10 text-gold'
                        : 'text-mist hover:text-ivory hover:bg-graphite/50'
                      }
                    `}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="hidden md:flex w-9 h-9 rounded-full bg-gradient-to-br from-gold/20 to-emerald-deep/30 items-center justify-center text-sm hover:from-gold/30 transition-colors"
              >
                👤
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-mist hover:text-ivory"
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gold/10 bg-graphite/50 backdrop-blur-xl">
            <nav className="px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      block px-4 py-3 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-gold/10 text-gold'
                        : 'text-mist hover:text-ivory hover:bg-graphite'
                      }
                    `}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian/95 backdrop-blur-xl border-t border-gold/10 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center px-4 py-2 transition-colors
                  ${isActive ? 'text-gold' : 'text-mist'}
                `}
              >
                <span className="text-xl mb-0.5">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

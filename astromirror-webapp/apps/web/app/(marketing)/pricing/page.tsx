/**
 * AstroMirror - Pricing Page
 */
import Link from 'next/link'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'für immer',
    features: [
      'Vollständiges Radix-Horoskop',
      'Swiss Ephemeris Präzision',
      'Tägliche Transit-Übersicht',
      '3 Voice-Minuten/Monat',
      'Archetyp-Quiz',
    ],
    cta: 'Kostenlos starten',
    href: '/signup',
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19,
    period: '/Monat',
    features: [
      'Alles aus Free',
      '30 Voice-Minuten/Monat',
      'Detaillierte Aspekt-Analyse',
      'Solar Return Jahreshoroskop',
      'Progressionen & Direktionen',
      'Partnerschafts-Synastrie',
      'E-Mail Support',
    ],
    cta: 'Premium wählen',
    href: '/signup?plan=premium',
    highlighted: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 299,
    period: 'einmalig',
    features: [
      'Alles aus Premium',
      'Unbegrenzte Voice-Minuten',
      'Früher Zugang zu neuen Features',
      'Prioritäts-Support',
      'Für immer – keine Abo-Kosten',
    ],
    cta: 'Lifetime sichern',
    href: '/signup?plan=lifetime',
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen py-20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-obsidian/80 backdrop-blur-xl border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-display text-gradient-gold">
            AstroMirror
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-mist hover:text-ivory transition-colors">
              Anmelden
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-20 pb-16 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-display text-ivory mb-4">
          Transparente <span className="text-gradient-gold">Preise</span>
        </h1>
        <p className="text-lg text-mist/70 max-w-xl mx-auto">
          Starte kostenlos. Upgrade wenn du mehr willst. Keine versteckten Kosten.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`card relative flex flex-col ${
                plan.highlighted
                  ? 'border-gold/40 bg-gradient-to-b from-gold/5 to-transparent'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-obsidian text-xs font-bold px-4 py-1 rounded-full">
                  BELIEBT
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-display text-ivory mb-2">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display text-gold">{plan.price}€</span>
                  <span className="text-mist/60">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-mist/80">
                    <span className="text-gold mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`text-center py-3 rounded-xl font-medium transition-all ${
                  plan.highlighted
                    ? 'btn-primary'
                    : 'btn-ghost'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Teaser */}
      <div className="max-w-2xl mx-auto px-6 mt-20 text-center">
        <h2 className="text-2xl font-display text-ivory mb-4">Fragen?</h2>
        <p className="text-mist/70 mb-6">
          Besuche unsere FAQ oder schreib uns – wir helfen gerne.
        </p>
        <Link href="/faq" className="text-gold hover:text-gold-muted transition-colors">
          Zu den FAQ →
        </Link>
      </div>

      {/* Guarantee */}
      <div className="max-w-xl mx-auto px-6 mt-16">
        <div className="card text-center bg-emerald-deep/10 border-emerald-accent/20">
          <div className="text-3xl mb-3">🛡️</div>
          <h3 className="font-display text-ivory mb-2">14 Tage Geld-zurück-Garantie</h3>
          <p className="text-sm text-mist/70">
            Nicht zufrieden? Volle Erstattung innerhalb von 14 Tagen, keine Fragen.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-mist/50">
            © 2025 AstroMirror. Zur Reflexion & Unterhaltung.
          </p>
          <div className="flex items-center gap-6 text-sm text-mist/50">
            <Link href="/impressum" className="hover:text-ivory transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-ivory transition-colors">Datenschutz</Link>
            <Link href="/agb" className="hover:text-ivory transition-colors">AGB</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

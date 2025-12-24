/**
 * AstroMirror - Landing Page
 * Premium Marketing Homepage
 */
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-obsidian/80 backdrop-blur-xl border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-display text-gradient-gold">
            AstroMirror
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/quiz/cosmic-archetype" className="text-mist hover:text-ivory transition-colors">
              Archetyp-Quiz
            </Link>
            <Link href="/pricing" className="text-mist hover:text-ivory transition-colors">
              Preise
            </Link>
            <Link href="/faq" className="text-mist hover:text-ivory transition-colors">
              FAQ
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-mist hover:text-ivory transition-colors">
              Anmelden
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4">
              Kostenlos starten
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-deep/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-tight">
            <span className="text-gradient-gold">Dein kosmischer</span>
            <br />
            <span className="text-ivory">Spiegel</span>
          </h1>
          
          <p className="mt-8 text-xl md:text-2xl text-mist max-w-2xl mx-auto leading-relaxed">
            Premium-Astrologie mit Voice-Agent. 
            Persönlich. Präzise. Spiegelnd.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
              Jetzt starten – Kostenlos
            </Link>
            <Link href="/quiz/cosmic-archetype" className="btn-ghost text-lg px-8 py-4 w-full sm:w-auto">
              Erst Quiz machen
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-mist/50">
            Keine Kreditkarte erforderlich • 3 Voice-Minuten gratis
          </p>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gold/30 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-gold/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-graphite/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display text-center text-ivory mb-16">
            Astronomische Präzision trifft <span className="text-gradient-gold">moderne KI</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card group hover:border-gold/30 transition-all duration-300">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🎙️
              </div>
              <h3 className="text-xl font-display text-ivory mb-3">Voice Agent</h3>
              <p className="text-mist/80 leading-relaxed">
                Sprich mit deinem kosmischen Spiegel. Echtzeit-Reflexion basierend auf 
                deinem Radix und aktuellen Transiten.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="card group hover:border-gold/30 transition-all duration-300">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-emerald-deep/30 to-emerald-deep/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🔮
              </div>
              <h3 className="text-xl font-display text-ivory mb-3">Swiss Ephemeris</h3>
              <p className="text-mist/80 leading-relaxed">
                Professionelle Berechnungen wie Astrologen sie nutzen. 
                Placidus-Häuser mit intelligentem Polar-Fallback.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="card group hover:border-gold/30 transition-all duration-300">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-gold/20 to-emerald-deep/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                ✨
              </div>
              <h3 className="text-xl font-display text-ivory mb-3">Tägliche Transite</h3>
              <p className="text-mist/80 leading-relaxed">
                Aktuelle Planetenstellungen zu deinem Geburtshoroskop. 
                Verstehe kosmische Energien im Kontext.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display text-center text-ivory mb-16">
            In 3 Minuten <span className="text-gradient-gold">startklar</span>
          </h2>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-display text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-display text-ivory mb-2">Geburtsdaten eingeben</h3>
                <p className="text-mist/80">
                  Datum, Uhrzeit und Ort. Je genauer, desto präziser dein Spiegel.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-display text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-display text-ivory mb-2">Radix berechnen lassen</h3>
                <p className="text-mist/80">
                  Wir berechnen dein vollständiges Geburtshoroskop mit Swiss Ephemeris.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-display text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-display text-ivory mb-2">Mit dem Spiegel sprechen</h3>
                <p className="text-mist/80">
                  Starte eine Voice-Session und reflektiere über Transite, Fragen, Themen.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4">
              Kostenlos registrieren
            </Link>
          </div>
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="py-24 bg-gradient-to-br from-emerald-deep/20 to-obsidian">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-gold text-sm uppercase tracking-wider">Noch unsicher?</span>
          <h2 className="text-3xl md:text-4xl font-display text-ivory mt-4 mb-6">
            Entdecke deinen kosmischen Archetyp
          </h2>
          <p className="text-mist/80 text-lg mb-8">
            7 Fragen. 2 Minuten. Keine Anmeldung nötig.
            Finde heraus, welche astrologische Energie dich prägt.
          </p>
          <Link href="/quiz/cosmic-archetype" className="btn-primary text-lg px-8 py-4">
            Quiz starten →
          </Link>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display text-center text-ivory mb-4">
            Transparente Preise
          </h2>
          <p className="text-center text-mist/70 mb-16">
            Starte kostenlos. Upgrade wenn du mehr willst.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="card">
              <h3 className="text-xl font-display text-ivory mb-2">Free</h3>
              <p className="text-3xl font-display text-gold mb-6">0 €<span className="text-lg text-mist/60">/Monat</span></p>
              <ul className="space-y-3 text-mist/80 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span> Vollständiges Radix
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span> Tägliche Transit-Übersicht
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span> 3 Voice-Minuten/Monat
                </li>
              </ul>
              <Link href="/signup" className="btn-ghost w-full text-center">
                Kostenlos starten
              </Link>
            </div>
            
            {/* Premium */}
            <div className="card border-gold/30 bg-gold/5 relative">
              <div className="absolute -top-3 right-6 bg-gold text-obsidian text-xs font-bold px-3 py-1 rounded-full">
                BELIEBT
              </div>
              <h3 className="text-xl font-display text-ivory mb-2">Premium</h3>
              <p className="text-3xl font-display text-gold mb-6">19 €<span className="text-lg text-mist/60">/Monat</span></p>
              <ul className="space-y-3 text-mist/80 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span> Alles aus Free
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span> 30 Voice-Minuten/Monat
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span> Detaillierte Aspekte
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold">✓</span> Solar Return Analyse
                </li>
              </ul>
              <Link href="/signup?plan=premium" className="btn-primary w-full text-center">
                Premium wählen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="font-display text-gold">AstroMirror</p>
              <p className="text-sm text-mist/50 mt-1">Reflexion, nicht Vorhersage.</p>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-mist/60">
              <Link href="/impressum" className="hover:text-ivory transition-colors">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-ivory transition-colors">Datenschutz</Link>
              <Link href="/agb" className="hover:text-ivory transition-colors">AGB</Link>
            </div>
          </div>
          
          <p className="mt-8 text-center text-xs text-mist/40">
            © 2025 AstroMirror. Zur Reflexion & Unterhaltung – keine Lebensberatung.
          </p>
        </div>
      </footer>
    </div>
  )
}

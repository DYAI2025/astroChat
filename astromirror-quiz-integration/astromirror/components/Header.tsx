import Link from 'next/link';

export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      style={{ background: 'rgba(7, 7, 8, 0.9)', backdropFilter: 'blur(8px)' }}
    >
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link
          href="/quiz/cosmic-archetype"
          className="text-lg font-light tracking-wide"
          style={{ color: 'var(--gold-primary)' }}
        >
          AstroMirror
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/profile"
            className="text-sm"
            style={{ color: 'var(--text-mist)' }}
          >
            Meine Ergebnisse
          </Link>
          <Link
            href="/quiz/cosmic-archetype"
            className="text-sm"
            style={{ color: 'var(--gold-muted)' }}
          >
            Quiz
          </Link>
        </nav>
      </div>
    </header>
  );
}

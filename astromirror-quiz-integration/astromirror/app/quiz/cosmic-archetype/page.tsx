// /app/quiz/cosmic-archetype/page.tsx
// AstroMirror Cosmic Archetype Quiz Page

import { Metadata } from 'next';
import CosmicArchetypeQuiz from '@/components/CosmicArchetypeQuiz';

export const metadata: Metadata = {
  title: 'Dein Kosmischer Archetyp | AstroMirror',
  description: 'Entdecke in 3 Minuten, welche kosmische Signatur deine Seele trägt. Ein Spiegel für Menschen, die tiefer schauen wollen.',
  openGraph: {
    title: 'Dein Kosmischer Archetyp | AstroMirror',
    description: '7 Fragen. 3 Minuten. Eine Begegnung mit deinem kosmischen Muster.',
    type: 'website',
    images: [
      {
        url: '/og/cosmic-archetype-quiz.jpg',
        width: 1200,
        height: 630,
        alt: 'AstroMirror Cosmic Archetype Quiz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Welcher kosmische Archetyp bist du?',
    description: 'Entdecke deine Planeten-Signatur in 3 Minuten.',
  },
};

export default function CosmicArchetypeQuizPage() {
  return (
    <main className="min-h-screen bg-[#070708]">
      <CosmicArchetypeQuiz
        onComplete={(result) => {
          // Analytics: Track quiz completion
          if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'quiz_completed', {
              quiz_id: 'cosmic-archetype',
              profile_id: result.profile.id,
              is_fallback: result.is_fallback,
            });
          }
        }}
        onCTAClick={(url) => {
          // Analytics: Track CTA click
          if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'cta_clicked', {
              quiz_id: 'cosmic-archetype',
              cta_url: url,
            });
          }
        }}
      />
    </main>
  );
}

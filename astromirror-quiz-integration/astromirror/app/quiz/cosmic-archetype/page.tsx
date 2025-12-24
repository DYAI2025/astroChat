// /app/quiz/cosmic-archetype/page.tsx
// AstroMirror Cosmic Archetype Quiz Page
'use client';

import CosmicArchetypeQuiz from '@/components/CosmicArchetypeQuiz';

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

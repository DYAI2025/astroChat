import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getResultById } from '@/lib/session-store';
import { loadQuizData } from '@/lib/quiz-data';
import ProfileResult from '@/components/ProfileResult';
import type { Profile, FallbackProfile, ScoreState } from '@/types/quiz';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultDetailPage({ params }: PageProps) {
  const { id } = await params;

  const dbResult = await getResultById(id);
  if (!dbResult) {
    notFound();
  }

  const quizData = await loadQuizData();

  // Resolve full profile from quiz data
  let profile: Profile | FallbackProfile | undefined;
  profile = quizData.profiles.find((p) => p.id === dbResult.profile_id);
  if (!profile && dbResult.profile_id === quizData.fallback_profile.id) {
    profile = quizData.fallback_profile;
  }

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'var(--bg-obsidian)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/profile"
            className="text-sm flex items-center gap-2"
            style={{ color: 'var(--gold-muted)' }}
          >
            ← Zurück zu meinen Ergebnissen
          </Link>
        </div>

        <ProfileResult
          profile={profile}
          scores={dbResult.scores as ScoreState}
          disclaimer={quizData.quiz_meta.disclaimer}
          showCTA={true}
        />

        <div className="mt-12 text-center">
          <Link href="/quiz/cosmic-archetype" className="btn-luxury">
            QUIZ WIEDERHOLEN
          </Link>
        </div>
      </div>
    </div>
  );
}

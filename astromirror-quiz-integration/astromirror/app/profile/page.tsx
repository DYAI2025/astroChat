import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserResults } from '@/lib/session-store';
import { loadQuizData } from '@/lib/quiz-data';
import ResultCard from '@/components/ResultCard';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const results = await getUserResults();
  const quizData = await loadQuizData();

  // Map profile_id to archetype_name
  const getArchetypeName = (profileId: string): string => {
    const profile = quizData.profiles.find((p) => p.id === profileId);
    if (profile) return profile.archetype_name;
    if (profileId === quizData.fallback_profile.id) {
      return quizData.fallback_profile.archetype_name;
    }
    return 'Unbekannt';
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className="text-2xl font-light mb-1"
              style={{ color: 'var(--text-ivory)' }}
            >
              Meine Ergebnisse
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-mist)' }}>
              {user.email}
            </p>
          </div>
          <Link
            href="/quiz/cosmic-archetype"
            className="btn-luxury text-sm px-4 py-2"
          >
            NEUES QUIZ
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="surface p-12 text-center">
            <div className="text-4xl mb-4">✧</div>
            <h2
              className="text-lg mb-2"
              style={{ color: 'var(--gold-primary)' }}
            >
              Noch keine Ergebnisse
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-mist)' }}>
              Starte dein erstes Quiz, um deinen kosmischen Archetyp zu entdecken.
            </p>
            <Link href="/quiz/cosmic-archetype" className="btn-luxury">
              QUIZ STARTEN
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <ResultCard
                key={result.id}
                result={result}
                archetypeName={getArchetypeName(result.profile_id)}
              />
            ))}
          </div>
        )}

        <form action="/auth/signout" method="post" className="mt-12 text-center">
          <button
            type="submit"
            className="text-sm underline"
            style={{ color: 'var(--text-mist)' }}
          >
            Abmelden
          </button>
        </form>
      </div>
    </div>
  );
}

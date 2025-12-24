import Link from 'next/link';
import type { DbQuizResult } from '@/types/database';

interface ResultCardProps {
  result: DbQuizResult;
  archetypeName: string;
}

export default function ResultCard({ result, archetypeName }: ResultCardProps) {
  const date = new Date(result.completed_at).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Link
      href={`/profile/result/${result.id}`}
      className="surface block p-6 hover:border-gold-primary transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3
            className="text-lg font-light mb-1"
            style={{ color: 'var(--gold-primary)' }}
          >
            {archetypeName}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-mist)' }}>
            {date}
          </p>
        </div>
        <span style={{ color: 'var(--gold-muted)' }}>→</span>
      </div>
    </Link>
  );
}

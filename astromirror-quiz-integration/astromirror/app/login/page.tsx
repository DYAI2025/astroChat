'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
    } else {
      setStatus('sent');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4" style={{ color: 'var(--gold-primary)' }}>✧</div>
          <h1 className="text-2xl font-light mb-2" style={{ color: 'var(--text-ivory)' }}>
            AstroMirror
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-mist)' }}>
            Melde dich an, um dein kosmisches Profil zu entdecken
          </p>
        </div>

        {status === 'sent' ? (
          <div className="surface p-8 text-center">
            <div className="text-2xl mb-4">✉️</div>
            <h2 className="text-lg mb-2" style={{ color: 'var(--gold-primary)' }}>
              Prüfe dein Postfach
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-mist)' }}>
              Wir haben dir einen magischen Link an <strong>{email}</strong> gesendet.
              Klicke darauf, um dich anzumelden.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="surface p-8">
            <label className="block mb-6">
              <span className="text-sm mb-2 block" style={{ color: 'var(--text-mist)' }}>
                E-Mail-Adresse
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="deine@email.de"
                className="w-full px-4 py-3 bg-transparent border rounded"
                style={{
                  borderColor: 'var(--gold-muted)',
                  color: 'var(--text-ivory)',
                }}
              />
            </label>

            {status === 'error' && (
              <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-luxury w-full"
              style={{ opacity: status === 'loading' ? 0.7 : 1 }}
            >
              {status === 'loading' ? 'WIRD GESENDET...' : 'MAGISCHEN LINK SENDEN'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

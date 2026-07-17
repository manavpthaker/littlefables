'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ParentLoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/parent/auth/callback` },
    });
    setPending(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  return (
    <main style={{ maxWidth: 420, margin: '10dvh auto', display: 'grid', gap: 'var(--space-4)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: 0 }}>Parent Corner</h1>
      <p style={{ color: 'var(--ink-soft)', margin: 0 }}>
        Sign in with a magic link. Only parents see this side.
      </p>
      {sent ? (
        <p style={{ background: 'var(--wash-panel)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
          Check your email. In local dev, magic links land at{' '}
          <a href="http://127.0.0.1:54324" target="_blank" rel="noreferrer">
            Inbucket
          </a>
          .
        </p>
      ) : (
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 16,
                border: '1px solid var(--ink-faint)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'inherit',
              }}
            />
          </label>
          <button
            type="submit"
            disabled={pending || !email}
            style={{
              padding: 'var(--space-3)',
              background: 'var(--action)',
              color: 'var(--paper)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              fontSize: 16,
              cursor: pending ? 'wait' : 'pointer',
            }}
          >
            {pending ? 'Sending…' : 'Send magic link'}
          </button>
          {error && <p style={{ color: 'var(--danger, #c94a3b)', margin: 0 }}>{error}</p>}
        </form>
      )}
    </main>
  );
}

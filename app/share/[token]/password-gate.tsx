'use client';

import { useState } from 'react';

// Password prompt for a share that carries one. POSTs to
// /api/share/[token]; success sets the unlock cookie and reloads.

export function SharePasswordGate({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/share/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error === 'wrong_password' ? 'That password did not match.' : 'Could not unlock.');
        return;
      }
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-4)',
        background: 'var(--surface-page)',
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%',
          maxWidth: 380,
          padding: 'var(--space-6)',
          background: 'var(--surface-card)',
          border: 'var(--border-soft)',
          borderRadius: 'var(--radius-lg)',
          display: 'grid',
          gap: 'var(--space-3)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-title)',
            margin: 0,
            color: 'var(--text-strong)',
          }}
        >
          A shared story
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-body)' }}>
          Enter the password to open this story.
        </p>
        <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
          <span style={{ fontSize: 'var(--text-body)' }}>Password</span>
          <input
            type="password"
            autoFocus
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 16,
              border: '1px solid var(--ink-faint)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--paper-bright)',
            }}
          />
        </label>
        {error && (
          <p style={{ margin: 0, color: 'var(--danger, #c94a3b)', fontSize: 'var(--text-caption)' }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={busy || password.length === 0}
          style={{
            marginTop: 'var(--space-1)',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--action)',
            color: 'var(--paper)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 600,
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy ? 'Checking…' : 'Open story'}
        </button>
      </form>
    </main>
  );
}

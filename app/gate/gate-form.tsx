'use client';

import { useState } from 'react';

export function GateForm({ nextPath }: { nextPath: string }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error === 'wrong_password' ? 'That password did not match.' : 'Could not unlock.');
        return;
      }
      // Hard nav so the cookie is present on the RSC that renders the target.
      window.location.href = nextPath || '/';
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-2)' }}>
      <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
        <span style={{ fontSize: 'var(--text-body)' }}>Password</span>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
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
        {busy ? 'Checking…' : 'Open storytime'}
      </button>
    </form>
  );
}

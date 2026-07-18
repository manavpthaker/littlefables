'use client';

import { useState } from 'react';

export function GateForm() {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/parent/gate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = '/parent';
      return;
    }
    setError('Wrong password.');
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
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
        disabled={busy || !password}
        style={{
          padding: 'var(--space-3)',
          background: 'var(--action)',
          color: 'var(--action-ink)',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          fontSize: 16,
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        {busy ? 'Checking…' : 'Enter'}
      </button>
      {error && <p style={{ color: 'var(--life-blocked)', margin: 0 }}>{error}</p>}
    </form>
  );
}

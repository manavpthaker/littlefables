'use client';

import { useState } from 'react';

export function SendToDeviceButton({ childId, childName }: { childId: string; childName: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const res = await fetch('/api/parent/child-token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ childId, deviceLabel: 'this device' }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? `HTTP ${res.status}`);
      setPending(false);
      return;
    }
    window.location.href = '/read';
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
      <button
        onClick={onClick}
        disabled={pending}
        style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--oxblood)',
          color: 'var(--paper-warm)',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          fontFamily: 'inherit',
          fontSize: 'var(--text-body-size)',
          fontWeight: 600,
          cursor: pending ? 'wait' : 'pointer',
          boxShadow: 'var(--shadow-rest)',
        }}
      >
        {pending ? 'Sending…' : `Send ${childName} to this device →`}
      </button>
      {error && <span style={{ color: 'var(--burgundy)', fontSize: 'var(--text-caption-size)' }}>{error}</span>}
    </div>
  );
}

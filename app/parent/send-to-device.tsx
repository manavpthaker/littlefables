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
    // Cookie is set server-side on this response — just navigate.
    window.location.href = '/read';
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-1)', justifyItems: 'end' }}>
      <button
        onClick={onClick}
        disabled={pending}
        style={{
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--action)',
          color: 'var(--paper)',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          cursor: pending ? 'wait' : 'pointer',
        }}
      >
        {pending ? 'Sending…' : `Send ${childName} to this device`}
      </button>
      {error && <span style={{ color: 'var(--danger, #c94a3b)', fontSize: 12 }}>{error}</span>}
    </div>
  );
}

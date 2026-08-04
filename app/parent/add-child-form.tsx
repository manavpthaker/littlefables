'use client';

import { useState } from 'react';
import { SectionHeader } from '@ds/components/parent/SectionHeader.jsx';

export function AddChildForm() {
  const [displayName, setDisplayName] = useState('');
  const [band, setBand] = useState<'3-4' | '4-6' | '4-8' | '6-8'>('4-8');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/parent/child', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim(), band }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDisplayName('');
      setOpen(false);
      // Zero-friction flow: after adding a child, jump the browser to
      // /api/enter — it will mint a device cookie (fresh install) or
      // verify the existing one (adding a second child from a signed-in
      // browser) and land the user directly in /read.
      window.location.href = '/api/enter';
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-2) var(--space-3)',
          background: 'transparent',
          color: 'var(--oxblood)',
          border: '1px dashed var(--oxblood)',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
        }}
      >
        + Add a child
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--wash-panel)', borderRadius: 'var(--radius-md)' }}>
      <SectionHeader label="Add a child" />
      <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
        <span>Name</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 16, border: '1px solid var(--ink-faint)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit' }}
        />
      </label>
      <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
        <span>Reading band</span>
        <select
          value={band}
          onChange={(e) => setBand(e.target.value as typeof band)}
          style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 16, border: '1px solid var(--ink-faint)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit' }}
        >
          <option value="3-4">3-4</option>
          <option value="4-6">4-6</option>
          <option value="4-8">4-8</option>
          <option value="6-8">6-8</option>
        </select>
      </label>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--oxblood)',
            color: 'var(--paper)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy ? 'Adding…' : 'Add'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            background: 'transparent',
            color: 'var(--ink)',
            border: '1px solid var(--ink-faint)',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
      {error && <p style={{ color: 'var(--danger, #c94a3b)', margin: 0 }}>{error}</p>}
    </form>
  );
}

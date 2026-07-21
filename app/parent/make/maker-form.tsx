'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Kind = 'quick' | 'chapter';

export function MakerForm() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [kind, setKind] = useState<Kind>('quick');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bookId: string; status: string } | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!idea.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/parent/story/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim(), kind }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { bookId: string; status: string };
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
        <span>What should this story be about?</span>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder='e.g. "She was scared of the car wash today."'
          rows={4}
          required
          style={{
            padding: 'var(--space-3)',
            fontSize: 16,
            border: '1px solid var(--ink-faint)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </label>

      <fieldset style={{ display: 'flex', gap: 'var(--space-2)', border: 'none', padding: 0 }}>
        <legend style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 'var(--space-1)' }}>Length</legend>
        {(['quick', 'chapter'] as Kind[]).map((k) => (
          <label
            key={k}
            style={{
              flex: 1,
              padding: 'var(--space-3)',
              border: `2px solid ${kind === k ? 'var(--action)' : 'var(--ink-faint)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <input
              type="radio"
              name="kind"
              value={k}
              checked={kind === k}
              onChange={() => setKind(k)}
              style={{ position: 'absolute', opacity: 0 }}
            />
            {k === 'quick' ? '5-minute quick story' : '20-minute chapter book'}
          </label>
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={busy || !idea.trim()}
        style={{
          padding: 'var(--space-3)',
          background: 'var(--action)',
          color: 'var(--paper)',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          fontSize: 16,
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        {busy ? 'Making it…' : 'Make it'}
      </button>

      {error && <p style={{ color: 'var(--danger, #c94a3b)', margin: 0 }}>{error}</p>}
      {result && (
        <div style={{ padding: 'var(--space-3)', background: 'var(--wash-panel)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0 }}>
            <strong>Status: {result.status}</strong>
          </p>
          <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--ink-soft)' }}>
            Book ID: {result.bookId}
          </p>
          <button
            onClick={() => router.push('/parent/stories')}
            style={{
              marginTop: 'var(--space-3)',
              background: 'var(--action)',
              color: 'var(--paper)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: 'var(--space-2) var(--space-4)',
              cursor: 'pointer',
            }}
          >
            See it in Stories
          </button>
        </div>
      )}
    </form>
  );
}

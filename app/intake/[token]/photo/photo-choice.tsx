'use client';

import { useState } from 'react';

// Two buttons and a result line. No cleverness on purpose: this is a privacy
// control, and a buyer should never be unsure whether it worked.
//
// "Delete it" is styled as the plain/primary path rather than as a scary
// destructive action. Deleting is the default we promised and the outcome we
// want to make easy; dressing it in red would nudge people toward keeping a
// photograph of their child on someone else's server.

type Choice = 'keep' | 'delete';

export function PhotoChoice({
  token,
  childName,
  current,
}: {
  token: string;
  childName: string;
  current: 'pending' | 'keep' | 'delete';
}) {
  const [choice, setChoice] = useState<'pending' | Choice>(current);
  const [busy, setBusy] = useState<Choice | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(next: Choice) {
    setBusy(next);
    setError(null);
    try {
      const res = await fetch('/api/intake/photo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, choice: next }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || 'that did not save');
      setChoice(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'that did not save');
    } finally {
      setBusy(null);
    }
  }

  const kid = childName || 'your child';

  return (
    <>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          margin: 0,
          color: 'var(--ink)',
          lineHeight: 1.15,
        }}
      >
        The photo you sent us
      </h1>
      <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 17, lineHeight: 1.6 }}>
        {kid}&rsquo;s book is finished, so we don&rsquo;t need the photo any more. We can
        delete it now, or keep it on file so a future book can use the same character
        without you sending it again. You can change this whenever you like.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
        <button
          type="button"
          onClick={() => submit('delete')}
          disabled={busy !== null}
          style={{
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--oxblood)',
            background: choice === 'delete' ? 'var(--oxblood)' : 'transparent',
            color: choice === 'delete' ? 'var(--on-oxblood)' : 'var(--oxblood-text)',
            font: '600 15px/1 var(--font-body)',
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy === 'delete' ? 'Deleting…' : choice === 'delete' ? 'Deleted' : 'Delete it'}
        </button>
        <button
          type="button"
          onClick={() => submit('keep')}
          disabled={busy !== null || choice === 'delete'}
          style={{
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid color-mix(in srgb, var(--ink) 30%, transparent)',
            background: choice === 'keep' ? 'color-mix(in srgb, var(--ink) 8%, transparent)' : 'transparent',
            color: 'var(--ink)',
            font: '600 15px/1 var(--font-body)',
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy === 'keep' ? 'Saving…' : 'Keep it for future books'}
        </button>
      </div>

      {choice === 'delete' && !busy && (
        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6 }}>
          Deleted. It is off our systems &mdash; nothing further is needed.
        </p>
      )}
      {choice === 'keep' && !busy && (
        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6 }}>
          We&rsquo;ll keep it on file for a future book. Come back to this page any
          time to have it deleted.
        </p>
      )}
      {choice === 'pending' && (
        <p style={{ margin: 0, color: 'var(--ink-faint)', fontSize: 14, lineHeight: 1.6 }}>
          If you don&rsquo;t choose, we delete it.
        </p>
      )}
      {error && (
        <p style={{ margin: 0, color: 'var(--oxblood-text)', fontSize: 15 }} role="alert">
          {error}
        </p>
      )}
    </>
  );
}

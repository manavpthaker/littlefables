'use client';

import { useState } from 'react';
import { SectionHeader } from '@ds/components/parent/ParentPrimitives.jsx';
import { useRouter } from 'next/navigation';

export interface PendingArt {
  id: string;
  bookId: string | null;
  bookTitle: string | null;
  kind: 'cover' | 'scene' | 'sheet';
  chapterIdx: number | null;
  pageIdx: number | null;
  previewUrl: string;
  createdAt: string;
}

interface BookForGeneration {
  id: string;
  title: string;
  hasCover: boolean;
}

export function ArtSection({
  pending,
  books,
}: {
  pending: PendingArt[];
  books: BookForGeneration[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, action: 'approve' | 'reject') {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch('/api/parent/art/approve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ artifactId: id, action }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function generateCover(bookId: string) {
    setBusyId(bookId);
    setError(null);
    try {
      const res = await fetch('/api/parent/art/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bookId, kind: 'cover' }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <SectionHeader>Art</SectionHeader>
      {error && <p style={{ color: 'var(--danger, #c94a3b)', margin: 0 }}>{error}</p>}

      {pending.length > 0 && (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 16 }}>Pending review</h3>
          {pending.map((a) => (
            <article
              key={a.id}
              style={{ background: 'var(--wash-panel)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', display: 'grid', gap: 'var(--space-2)' }}
            >
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.previewUrl}
                  alt={`${a.kind} candidate`}
                  style={{ width: 120, height: 160, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />
                <div style={{ flex: 1, display: 'grid', gap: 'var(--space-1)' }}>
                  <strong>{a.bookTitle ?? a.bookId ?? 'Unknown book'}</strong>
                  <span style={{ color: 'var(--ink-soft)', fontSize: 12 }}>
                    {a.kind}
                    {a.chapterIdx != null ? ` · ch ${a.chapterIdx + 1}` : ''}
                    {a.pageIdx != null ? ` · p ${a.pageIdx + 1}` : ''}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  onClick={() => act(a.id, 'approve')}
                  disabled={busyId === a.id}
                  style={{
                    flex: 1,
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--action)',
                    color: 'var(--paper)',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    cursor: busyId === a.id ? 'wait' : 'pointer',
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => act(a.id, 'reject')}
                  disabled={busyId === a.id}
                  style={{
                    flex: 1,
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'transparent',
                    color: 'var(--ink)',
                    border: '1px solid var(--ink-faint)',
                    borderRadius: 'var(--radius-pill)',
                    cursor: busyId === a.id ? 'wait' : 'pointer',
                  }}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {books.length > 0 && (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 16 }}>Generate cover art</h3>
          {books.map((b) => (
            <div
              key={b.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) var(--space-3)', background: 'var(--wash-panel)', borderRadius: 'var(--radius-md)' }}
            >
              <span>{b.title}</span>
              <button
                onClick={() => generateCover(b.id)}
                disabled={busyId === b.id}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--action)',
                  color: 'var(--paper)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  cursor: busyId === b.id ? 'wait' : 'pointer',
                }}
              >
                {busyId === b.id ? 'Painting…' : b.hasCover ? 'Regenerate' : 'Generate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

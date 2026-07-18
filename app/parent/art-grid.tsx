'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArtApproval } from '@ds/components/parent/ArtApproval.jsx';
import { SectionHeader } from '@ds/components/parent/ParentPrimitives.jsx';

// Candidate grid grouped by book. Uses the DS ArtApproval component per
// candidate, one row per candidate; approve-all-for-book quick action per
// group. Rejecting prompts for a short reason; both actions POST to the
// existing /api/parent/art/approve route.

export interface CandidateView {
  id: string;
  bookId: string | null;
  bookTitle: string | null;
  kind: 'cover' | 'scene' | 'sheet';
  chapterIdx: number | null;
  pageIdx: number | null;
  previewUrl: string;
}

interface Group {
  bookId: string;
  bookTitle: string;
  candidates: CandidateView[];
}

function groupByBook(candidates: CandidateView[]): Group[] {
  const map = new Map<string, Group>();
  for (const c of candidates) {
    const key = c.bookId ?? '__unknown__';
    const g = map.get(key) ?? { bookId: key, bookTitle: c.bookTitle ?? 'Unknown book', candidates: [] };
    g.candidates.push(c);
    map.set(key, g);
  }
  return Array.from(map.values());
}

export function ArtGrid({ candidates }: { candidates: CandidateView[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const groups = groupByBook(candidates);

  async function post(action: 'approve' | 'reject', artifactId: string, reason?: string) {
    setBusyId(artifactId);
    setError(null);
    try {
      const res = await fetch('/api/parent/art/approve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ artifactId, action, reason }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      startTransition(() => router.refresh());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function approveAllInBook(group: Group) {
    for (const c of group.candidates) {
      await post('approve', c.id);
    }
  }

  if (groups.length === 0) {
    return (
      <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <SectionHeader>Art review</SectionHeader>
        <p style={{ color: 'var(--text-muted)' }}>No candidates pending.</p>
      </section>
    );
  }

  return (
    <section style={{ display: 'grid', gap: 'var(--space-5)' }}>
      <SectionHeader>Art review</SectionHeader>
      {error && <p style={{ color: 'var(--life-blocked)', margin: 0 }}>{error}</p>}
      {groups.map((g) => (
        <article key={g.bookId} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)' }}>{g.bookTitle}</h3>
            <button
              disabled={pending || busyId !== null}
              onClick={() => approveAllInBook(g)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'transparent',
                color: 'var(--action)',
                border: '1px solid var(--action)',
                borderRadius: 'var(--radius-pill)',
                cursor: pending || busyId ? 'wait' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Approve all in {g.bookTitle.split(' ').slice(0, 2).join(' ')}…
            </button>
          </header>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
            {g.candidates.map((c) => (
              <ArtApproval
                key={c.id}
                pageLabel={
                  c.kind === 'cover'
                    ? 'Cover'
                    : `Ch ${c.chapterIdx ?? 0 + 1} · P ${(c.pageIdx ?? 0) + 1}`
                }
                candidate={c.previewUrl}
                onApprove={() => post('approve', c.id)}
                onReject={() => {
                  const reason = window.prompt('Why? (optional short note — used to steer next generation)') ?? undefined;
                  void post('reject', c.id, reason || undefined);
                }}
              />
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

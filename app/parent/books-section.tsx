'use client';

import { useState } from 'react';
import { SectionHeader } from '@ds/components/parent/ParentPrimitives.jsx';
import { useRouter } from 'next/navigation';

export type ParentBookStatus =
  | 'draft'
  | 'checking'
  | 'published'
  | 'needs-review'
  | 'blocked'
  | 'unverified'
  | 'complete'
  | 'awaiting-choice';

export interface ParentBook {
  id: string;
  title: string;
  status: ParentBookStatus;
  source: string;
  hardGatesPassed?: boolean | null;
  softScoreTotal?: number | null;
  updatedAt: string;
  /** Most recent art-approval timestamp for this book (any kind). Optional. */
  artApprovedAt?: string | null;
  /** on the child's shelf (books.shelf_enabled) — the Stories-tab toggle */
  shelfEnabled?: boolean;
  /** what this story teaches (teachingGoals joined) — brief §III.5 */
  teaches?: string | null;
}

const STATUS_COLOR: Record<ParentBookStatus, { bg: string; text: string }> = {
  draft: { bg: 'var(--ink-faint)', text: 'var(--ink)' },
  checking: { bg: 'var(--butter)', text: 'var(--ink)' },
  published: { bg: 'var(--sage)', text: 'var(--paper)' },
  'needs-review': { bg: 'var(--marigold)', text: 'var(--ink)' },
  blocked: { bg: 'var(--danger, #c94a3b)', text: 'var(--paper)' },
  unverified: { bg: 'var(--lilac)', text: 'var(--ink)' },
  complete: { bg: 'var(--wash-panel)', text: 'var(--ink)' },
  'awaiting-choice': { bg: 'var(--wash-panel)', text: 'var(--ink)' },
};

export function BooksSection({ books }: { books: ParentBook[] }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <SectionHeader trailing={<a href="/parent/make" style={{ color: 'var(--action)' }}>+ Make a story</a>}>
        Books
      </SectionHeader>
      {books.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)' }}>No books yet.</p>
      ) : (
        books.map((b) => <BookRow key={b.id} book={b} />)
      )}
    </section>
  );
}

function ShelfToggle({ bookId, initial }: { bookId: string; initial: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !enabled;
    setEnabled(next); // optimistic
    setBusy(true);
    try {
      const res = await fetch('/api/parent/story/visibility', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bookId, enabled: next }),
      });
      if (!res.ok) setEnabled(!next);
      else router.refresh();
    } catch {
      setEnabled(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 14, color: 'var(--ink-soft)', cursor: 'pointer' }}>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        disabled={busy}
        style={{
          width: 42,
          height: 24,
          borderRadius: 12,
          border: 'none',
          cursor: busy ? 'wait' : 'pointer',
          background: enabled ? 'var(--sage)' : 'var(--ink-faint)',
          position: 'relative',
          transition: 'background 160ms ease',
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: enabled ? 21 : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'var(--paper-bright)',
            transition: 'left 160ms ease',
          }}
        />
      </button>
      {enabled ? "on the child's shelf" : 'hidden from the shelf'}
    </label>
  );
}

function BookRow({ book }: { book: ParentBook }) {
  const router = useRouter();
  const [busy, setBusy] = useState<'publish' | 'block' | null>(null);
  const [status, setStatus] = useState<ParentBookStatus>(book.status);
  const color = STATUS_COLOR[status];

  async function act(action: 'publish' | 'block') {
    setBusy(action);
    try {
      const res = await fetch('/api/parent/story/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bookId: book.id, action }),
      });
      if (res.ok) {
        const data = (await res.json()) as { status: ParentBookStatus };
        setStatus(data.status);
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <article style={{ padding: 'var(--space-3)', background: 'var(--wash-panel)', borderRadius: 'var(--radius-md)', display: 'grid', gap: 'var(--space-2)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{book.title}</div>
        <span
          style={{
            background: color.bg,
            color: color.text,
            padding: '2px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {status}
        </span>
      </header>
      <div style={{ display: 'flex', gap: 'var(--space-3)', color: 'var(--ink-soft)', fontSize: 14, flexWrap: 'wrap' }}>
        <span>source: {book.source}</span>
        {book.hardGatesPassed != null && <span>hard-gates: {book.hardGatesPassed ? 'passed' : 'failed'}</span>}
        {book.softScoreTotal != null && <span>score: {Math.round(book.softScoreTotal)}</span>}
      </div>
      {book.teaches && (
        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 14 }}>teaches: {book.teaches}</p>
      )}
      {book.shelfEnabled !== undefined && <ShelfToggle bookId={book.id} initial={book.shelfEnabled} />}
      {/* Provenance line — reads left-to-right as a warm sentence about
          exactly what happened to this book. */}
      <p style={{ margin: 0, fontFamily: 'var(--font-hand)', color: 'var(--text-muted)', fontSize: 14 }}>
        {book.source === 'generated'
          ? 'written with your family universe'
          : book.source === 'family' || book.source === 'family-original'
          ? 'family original — carried over from before the app'
          : 'starter — pack seed'}
        {book.hardGatesPassed != null && ` · QA ${book.hardGatesPassed ? 'passed' : 'failed'}`}
        {book.softScoreTotal != null && ` (score ${Math.round(book.softScoreTotal)})`}
        {book.artApprovedAt && ` · art approved ${new Date(book.artApprovedAt).toLocaleDateString()}`}
      </p>
      {(status === 'needs-review' || status === 'unverified') && (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={() => act('publish')}
            disabled={Boolean(busy)}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--action)',
              color: 'var(--paper)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            {busy === 'publish' ? 'Publishing…' : 'Publish to Azad'}
          </button>
          <button
            onClick={() => act('block')}
            disabled={Boolean(busy)}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-3)',
              background: 'transparent',
              color: 'var(--ink)',
              border: '1px solid var(--ink-faint)',
              borderRadius: 'var(--radius-pill)',
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            {busy === 'block' ? 'Blocking…' : 'Block'}
          </button>
        </div>
      )}
    </article>
  );
}

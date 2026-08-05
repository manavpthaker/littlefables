'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSwipeTurn } from '@/lib/reader/use-swipe-turn';
import { BookCover } from './book-cover';
import type { ShelfBook } from './library';

// The two library layouts, kept out of library.tsx so the parent
// component stays under the 400-line lint ceiling and the sort/search
// state doesn't share a file with heavy JSX.

export function GridView({ books }: { books: ShelfBook[] }) {
  return (
    <div className="lf-covers">
      {books.map((book) => (
        <BookCover key={book.id} book={book} />
      ))}
    </div>
  );
}

export function ListView({ books }: { books: ShelfBook[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-1)' }}>
      {books.map((book) => {
        const thumb = book.coverImage ?? undefined;
        return (
          <li key={book.id}>
            <Link
              href={`/read/story/${book.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr auto',
                gap: 'var(--space-3)',
                alignItems: 'center',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'inherit',
                background: 'transparent',
                transition: 'background 140ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--wash-panel)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span
                aria-hidden
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-md)',
                  background: thumb
                    ? `url(${thumb}) center/cover no-repeat`
                    : book.coverBg && !book.coverBg.startsWith('http')
                      ? book.coverBg
                      : 'linear-gradient(135deg, var(--paper-deep), var(--wash-panel))',
                  boxShadow: 'var(--shadow-rest)',
                }}
              />
              <span style={{ display: 'grid', gap: 2, minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 17,
                    lineHeight: 1.2,
                    color: 'var(--ink)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {book.title}
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)', textTransform: 'capitalize' }}>
                  {book.kind}
                </span>
              </span>
              <span aria-hidden style={{ color: 'var(--ink-soft)', fontSize: 18 }}>
                ›
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// One book at a time, for a child browsing rather than searching. Swipe or tap
// the arrows to move; tap the cover to open it.
//
// A lone centred cover gives no sign the shelf continues, which is the one
// thing this view has to communicate. The arrows and the "n of 20" carry that
// — deliberately, rather than by peeking the neighbours in at the edges, which
// would put two more covers on screen and undo the point of the view.
export function SingleView({ books }: { books: ShelfBook[] }) {
  const [i, setI] = useState(0);
  const at = Math.min(i, books.length - 1);

  const go = (d: number) => setI((n) => Math.min(books.length - 1, Math.max(0, n + d)));
  const swipe = useSwipeTurn({
    enabled: books.length > 1,
    onPrev: () => go(-1),
    onNext: () => go(1),
  });

  const current = books[at];
  if (!current) return null;

  return (
    <div
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
      style={{ display: 'grid', gap: 'var(--space-4)', justifyItems: 'center' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 300px) auto',
          alignItems: 'center',
          gap: 'var(--space-4)',
          width: '100%',
          maxWidth: 620,
        }}
      >
        <Step dir={-1} disabled={at === 0} onClick={() => go(-1)} />
        <div key={current.id} style={{ animation: 'lf-art-in var(--motion-settle) var(--ease-pendulum) both' }}>
          <BookCover book={current} />
        </div>
        <Step dir={1} disabled={at === books.length - 1} onClick={() => go(1)} />
      </div>

      <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>
        {at + 1} of {books.length}
      </p>
    </div>
  );
}

function Step({ dir, disabled, onClick }: { dir: 1 | -1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 1 ? 'Next story' : 'Previous story'}
      style={{
        width: 46,
        height: 46,
        borderRadius: '50%',
        border: '1px solid var(--pill-edge)',
        background: 'var(--wash-capsule)',
        color: 'var(--ink)',
        fontSize: 26,
        lineHeight: 1,
        display: 'grid',
        placeItems: 'center',
        opacity: disabled ? 0.28 : 1,
        boxShadow: disabled ? 'none' : 'var(--shadow-rest)',
      }}
    >
      {dir === 1 ? '›' : '‹'}
    </button>
  );
}

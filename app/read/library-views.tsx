'use client';

import Link from 'next/link';
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

'use client';

import type { ShelfBook } from './library';

// A library cover, built to read like a Penguin Classic rather than an app
// tile: art held above a printed band, a binding rule down the left edge, and
// the imprint set in small caps above the title.
//
// Wrapped here rather than by changing the design system's BookCard, which is
// consumed verbatim (PRD F1). This is a shelf-specific treatment, not a new
// primitive.
//
// The brass rule under the title doubles as the progress indicator. At zero it
// is simply the decorative rule the layout wants anyway, so an untouched book
// carries no half-finished UI — it just looks like a book.

export function BookCover({ book }: { book: ShelfBook }) {
  const art = book.coverImage ?? undefined;
  const pct = Math.round(Math.min(1, Math.max(0, book.progress)) * 100);

  return (
    <a href={`/read/story/${book.id}`} className="lf-cover" aria-label={book.title}>
      <span
        className="lf-cover-art"
        aria-hidden
        style={
          art
            ? { backgroundImage: `url(${art})` }
            : book.coverBg && !book.coverBg.startsWith('http')
              ? { background: book.coverBg }
              : undefined
        }
      />

      <span className="lf-cover-band">
        <span className="lf-cover-imprint">Little Fables</span>
        <span className="lf-cover-title">{book.title}</span>
        {book.byLine && <span className="lf-cover-sub">{book.byLine}</span>}
        <span className="lf-cover-rule" aria-hidden>
          <span style={{ width: `${pct}%` }} />
        </span>
      </span>

      {/* The binding. Runs the full height, across art and band alike —
          a board is bound before anything is printed on it. */}
      <span className="lf-cover-spine" aria-hidden />
    </a>
  );
}

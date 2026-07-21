'use client';

// Client wrapper around the design-system BookCard (imported verbatim per PRD F1).
// Server component fetches shelf → passes plain JSON here → we render the DS
// component with interactivity. Two variants (redesign brief §III):
//   row  — Home: one swipeable Shelf rail, covers carry layer-tag chips
//   grid — Library: two-column-on-phone cover grid
import { BookCard, Shelf } from '@ds/components/kid/BookCard.jsx';
import { LAYER_TAG_EMOJI, LAYER_TAG_LABELS, LAYER_TAG_PIGMENT, type LayerTag } from '@/lib/models/layer-tags';
import type { Interactivity } from '@/lib/models/book';

export interface ShelfBook {
  id: string;
  title: string;
  kind: 'quick' | 'chapter';
  coverEmoji: string | null;
  coverBg: string | null;
  coverImage?: string | null;
  status: string;
  /** developmental layer — chip on the cover */
  layerTag?: LayerTag;
  /** authored interactive moments (ask / choice / breathe) — shown as a small
   *  glyph strip under the title so a kid or parent can find "another one
   *  where I get to choose" or "another breathe story". */
  interactivity?: Interactivity[];
  /** 0..1 — how far the child has read this book. From book_progress. */
  progress: number;
}

const INTERACTIVITY_GLYPH: Record<Interactivity, { emoji: string; label: string }> = {
  ask: { emoji: '🎤', label: 'ask' },
  choice: { emoji: '🔀', label: 'choice' },
  breathe: { emoji: '🧘', label: 'breathe' },
};

function tagFor(book: ShelfBook) {
  if (!book.layerTag) return undefined;
  return {
    label: LAYER_TAG_LABELS[book.layerTag],
    emoji: LAYER_TAG_EMOJI[book.layerTag],
    pigment: LAYER_TAG_PIGMENT[book.layerTag],
  };
}

function EmptyShelf() {
  return (
    <p
      style={{
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-body)',
        margin: 0,
      }}
    >
      Ask a grown-up to make a story with you.
    </p>
  );
}

export function ShelfGrid({
  books,
  variant = 'grid',
}: {
  books: ShelfBook[];
  variant?: 'row' | 'grid';
}) {
  if (books.length === 0) return <EmptyShelf />;

  const cards = books.map((book) => {
    const glyphs = (book.interactivity ?? []).map((k) => INTERACTIVITY_GLYPH[k]);
    return (
      <div key={book.id} style={{ position: 'relative', width: variant === 'row' ? 126 : undefined }}>
        <BookCard
          title={book.title}
          utterance={book.title}
          progress={book.progress}
          cover={book.coverImage ?? undefined}
          bg={!book.coverImage && book.coverBg && !book.coverBg.startsWith('http') ? book.coverBg : undefined}
          tag={tagFor(book)}
          width={variant === 'row' ? 126 : '100%'}
          artRatio={variant === 'row' ? '126/158' : undefined}
          onOpen={() => {
            window.location.href = `/read/story/${book.id}`;
          }}
        />
        {glyphs.length > 0 && (
          <div
            aria-label={`This one has: ${glyphs.map((g) => g.label).join(', ')}`}
            style={{
              marginTop: 4,
              display: 'flex',
              gap: 6,
              fontSize: 14,
              lineHeight: 1,
              color: 'var(--ink-soft)',
            }}
          >
            {glyphs.map((g) => (
              <span key={g.label} title={g.label} aria-hidden>
                {g.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  });

  if (variant === 'row') {
    return <Shelf>{cards}</Shelf>;
  }

  return <div className="lf-covers">{cards}</div>;
}

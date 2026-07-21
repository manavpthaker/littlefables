'use client';

// Client wrapper around the design-system BookCard (imported verbatim per PRD F1).
// Server component fetches shelf → passes plain JSON here → we render the DS
// component with interactivity. Two variants (redesign brief §III):
//   row  — Home: one swipeable Shelf rail, covers carry layer-tag chips
//   grid — Library: two-column-on-phone cover grid
import { BookCard, Shelf } from '@ds/components/kid/BookCard.jsx';
import { LAYER_TAG_EMOJI, LAYER_TAG_LABELS, LAYER_TAG_PIGMENT, type LayerTag } from '@/lib/models/layer-tags';

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
  /** 0..1 — how far the child has read this book. From book_progress. */
  progress: number;
}

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

  const cards = books.map((book) => (
    <BookCard
      key={book.id}
      title={book.title}
      utterance={book.title}
      progress={book.progress}
      cover={book.coverImage ?? undefined}
      tag={tagFor(book)}
      onOpen={() => {
        window.location.href = `/read/story/${book.id}`;
      }}
    />
  ));

  if (variant === 'row') {
    return <Shelf>{cards}</Shelf>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 'var(--space-5)',
      }}
    >
      {cards}
    </div>
  );
}

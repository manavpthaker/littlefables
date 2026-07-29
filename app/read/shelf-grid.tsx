'use client';

// Book cover grid. Pure library — no chips, no glyphs, no meters. Kids pick
// a book and the reader takes it from there.
import { BookCard } from '@ds/components/kid/BookCard.jsx';

export interface ShelfBook {
  id: string;
  title: string;
  kind: 'quick' | 'chapter';
  coverEmoji: string | null;
  coverBg: string | null;
  coverImage?: string | null;
  /** 0..1 — sage progress line under the title if any progress exists. */
  progress: number;
}

function EmptyShelf() {
  return (
    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
      Add a story from the terminal to fill the shelf.
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
      bg={!book.coverImage && book.coverBg && !book.coverBg.startsWith('http') ? book.coverBg : undefined}
      width={variant === 'row' ? 126 : '100%'}
      artRatio={variant === 'row' ? '126/158' : undefined}
      onOpen={() => {
        window.location.href = `/read/story/${book.id}`;
      }}
    />
  ));

  return <div className="lf-covers">{cards}</div>;
}

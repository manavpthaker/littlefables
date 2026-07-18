'use client';

// Client wrapper around the design-system BookCard (imported verbatim per PRD F1).
// Server component fetches shelf → passes plain JSON here → we render the DS
// component with interactivity.
import { BookCard } from '@ds/components/kid/BookCard.jsx';

export interface ShelfBook {
  id: string;
  title: string;
  kind: 'quick' | 'chapter';
  coverEmoji: string | null;
  coverBg: string | null;
  coverImage?: string | null;
  status: string;
  /** 0..1 — how far the child has read this book. From book_progress. */
  progress: number;
}

export function ShelfGrid({ books }: { books: ShelfBook[] }) {
  if (books.length === 0) {
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

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 'var(--space-5)',
      }}
    >
      {books.map((book) => (
        <BookCard
          key={book.id}
          title={book.title}
          utterance={book.title}
          progress={book.progress}
          cover={book.coverImage ?? undefined}
          onOpen={() => {
            window.location.href = `/read/story/${book.id}`;
          }}
        />
      ))}
    </div>
  );
}

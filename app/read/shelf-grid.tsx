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
}

export function ShelfGrid({ books }: { books: ShelfBook[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
      }}
    >
      {books.map((book) => (
        <BookCard
          key={book.id}
          title={book.title}
          utterance={book.title}
          progress={0}
          cover={book.coverImage ?? undefined}
          onOpen={() => {
            window.location.href = `/read/story/${book.id}`;
          }}
        />
      ))}
    </div>
  );
}

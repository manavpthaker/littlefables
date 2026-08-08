'use client';

import { Reader } from '@/app/read/story/[id]/reader';
import type { ReaderBook } from '@/lib/reader/types';

// Public share reader — the same Reader component the household uses,
// with no progress tracking (guest, no household auth). Bedtime settings
// fall to defaults; a share visitor gets the day-voice experience by
// default and can flip to night via the reader's own chip.
//
// libraryHref: set for library shares so "Choose another story" returns to
// the shared shelf. Null (single-book shares) hides the button — there is
// no shelf behind a one-book link.

export function ShareReader({
  book,
  libraryHref = null,
}: {
  book: ReaderBook;
  libraryHref?: string | null;
}) {
  return <Reader book={book} initialProgress={null} libraryHref={libraryHref} />;
}

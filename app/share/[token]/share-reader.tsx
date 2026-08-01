'use client';

import { Reader } from '@/app/read/story/[id]/reader';
import type { ReaderBook } from '@/lib/reader/types';

// Public share reader — the same Reader component the household uses,
// with no progress tracking (guest, no household auth). Bedtime settings
// fall to defaults; a share visitor gets the day-voice experience by
// default and can flip to night via the reader's own chip.

export function ShareReader({ book }: { book: ReaderBook }) {
  return <Reader book={book} initialProgress={null} />;
}

'use client';

import { useEffect, useMemo } from 'react';
import type { ReaderBook, ReaderState } from '@/lib/reader/types';

// Approved-art read-ahead (ported from the little-fables archive's
// read-ahead walker, adapted to the approval pipeline: here art is already
// approved and published, so "read-ahead" means warming the browser cache
// for the next pages' images while the current one is being read — a page
// turn should never flash the wash while art streams in (audit finding:
// "the story page art needs to load with it and be visible").

const LOOKAHEAD = 3;

export function useArtPrefetch(book: ReaderBook, state: ReaderState): void {
  // Flatten once: reading order across chapters, img URLs only.
  const flat = useMemo(
    () =>
      book.chapters.flatMap((c, ci) =>
        c.pages.map((p, pi) => ({ key: `${ci}-${pi}`, img: p.img ?? null })),
      ),
    [book],
  );

  useEffect(() => {
    if (state.chapterIdx === null) return;
    const at = flat.findIndex((p) => p.key === `${state.chapterIdx}-${state.pageIdx}`);
    if (at < 0) return;
    for (const next of flat.slice(at + 1, at + 1 + LOOKAHEAD)) {
      if (!next.img) continue;
      const warm = new Image();
      warm.src = next.img;
    }
  }, [flat, state.chapterIdx, state.pageIdx]);
}

'use client';

import { useEffect, useRef } from 'react';
import { speakUtterance } from '@/lib/voice/ui-voice';
import type { ReaderBook } from '@/lib/reader/types';
import type { ProgressRecord } from '@/lib/models/progress';

// Recap-on-resume (ported from the little-fables archive). Coming back to a
// book after a day or more earns a spoken orientation in the buddy voice —
// a 4-year-old doesn't remember where "chapter 3, page 2" was. Voice-slot
// rules: ui-voice priority means starting narration supersedes the recap.

const RECAP_AFTER_MS = 24 * 60 * 60 * 1000;

export function useRecapOnResume(book: ReaderBook, initialProgress: ProgressRecord | null): void {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (!initialProgress) return;
    const age = Date.now() - new Date(initialProgress.updatedAt).getTime();
    if (!Number.isFinite(age) || age < RECAP_AFTER_MS) return;
    // At the very start of the book there is nothing to recap.
    if (initialProgress.chapterIdx === 0 && initialProgress.pageIdx === 0) return;

    const chapterTitle = book.chapters[initialProgress.chapterIdx]?.title;
    const line =
      book.kind === 'chapter' && chapterTitle
        ? `Welcome back to ${book.title}! We were reading ${chapterTitle}. Let's keep going.`
        : `Welcome back to ${book.title}! We'll pick up right where you left off.`;
    void speakUtterance(line, { voice: 'buddy' });
    // Mount-only by design: this speaks once per reader open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { saveWord } from './wordbook';
import { composeSaveUtterance } from './word-speech';
import { speakUtterance } from '@/lib/voice/ui-voice';
import type { ReaderBook } from './types';

// Word star-save (PRD A9), extracted from reader.tsx (Redesign 2026-07-21).
// Optimistic UI: the WordCapsule blooms as soon as the tap lands; failure
// rolls back. The spoken confirmation teaches when the word is in the book's
// vocab (syllables + kid definition), else just confirms the keep.

export interface WordSave {
  savedWord: string | null;
  justSaved: boolean;
  onStarWord: (stem: string) => void;
}

export function useWordSave(args: {
  book: ReaderBook;
  pageText: string | undefined;
  chapterIdx: number | null;
  pageIdx: number;
  onBadges: (slugs: string[]) => void;
}): WordSave {
  const { book, pageText, chapterIdx, pageIdx } = args;

  const [savedWord, setSavedWord] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const bloomTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (bloomTimer.current) clearTimeout(bloomTimer.current);
    },
    [],
  );

  // Keep the latest badge callback without making onStarWord unstable.
  const onBadgesRef = useRef(args.onBadges);
  onBadgesRef.current = args.onBadges;

  const onStarWord = useCallback(
    (stem: string) => {
      setSavedWord(stem);
      setJustSaved(true);
      if (bloomTimer.current) clearTimeout(bloomTimer.current);
      bloomTimer.current = setTimeout(() => setJustSaved(false), 1400);
      // Confirm aloud in the buddy voice — teaching when vocab is authored.
      void speakUtterance(composeSaveUtterance(stem, book.vocab[stem]), {
        voice: 'buddy',
        priority: 'tap',
      });

      saveWord({
        word: stem,
        sentence: pageText,
        bookId: book.id,
        chapterIdx: chapterIdx ?? undefined,
        pageIdx,
      })
        .then((res) => {
          if (res && res.newlyEarned.length) onBadgesRef.current(res.newlyEarned);
          // res === null means the write is queued for later (offline). The
          // optimistic bloom stays; sync banner surfaces the pending state.
        })
        .catch(() => {
          // Rollback bloom on failure — PRD C1 (audit C1 fix) — never silent-drop.
          setJustSaved(false);
          setSavedWord(null);
        });
    },
    [book.id, book.vocab, pageText, chapterIdx, pageIdx],
  );

  return { savedWord, justSaved, onStarWord };
}

'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReaderTopBar } from '@ds/components/reader/ReaderTopBar.jsx';
import { ChapterMap } from '@ds/components/reader/ChapterMap.jsx';
import { StoryText } from '@ds/components/reader/StoryText.jsx';
import { Transport } from '@ds/components/kid/Transport.jsx';
import { useReaderTransport } from '@/lib/reader/transport';
import { saveWord } from '@/lib/reader/wordbook';
import { pushProgress } from '@/lib/reader/progress';
import {
  currentChapter,
  currentPage,
  initialState,
  isFirstPage,
  isLastPage,
  reducer,
} from '@/lib/reader/state';
import type { ReaderBook, ReaderAction, ReaderState } from '@/lib/reader/types';
import type { ProgressRecord } from '@/lib/models/progress';

// Reader orchestrator (client). Owns page navigation + transport wiring.
// Word-tap save (Slice 3), progress sync (Slice 4), and pre-generated audio
// (Slice 5) layer on top without touching this file's core structure.

export function Reader({
  book,
  initialProgress,
}: {
  book: ReaderBook;
  initialProgress: ProgressRecord | null;
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    (s: ReaderState, a: ReaderAction) => reducer(book, s, a),
    initialProgress
      ? { chapterIdx: initialProgress.chapterIdx, pageIdx: initialProgress.pageIdx }
      : initialState(book),
  );

  // Push progress on every state change (debounced 500ms in progress.ts).
  // Skip when we're on the ChapterMap (chapterIdx === null) — nothing meaningful to resume.
  useEffect(() => {
    if (state.chapterIdx === null) return;
    pushProgress({
      bookId: book.id,
      chapterIdx: state.chapterIdx,
      pageIdx: state.pageIdx,
    });
  }, [book.id, state.chapterIdx, state.pageIdx]);

  const ch = currentChapter(book, state);
  const page = currentPage(book, state);
  const showMap = state.chapterIdx === null;
  const lastPage = isLastPage(book, state);

  // Feed the current page's text into the transport. Slice 5 supplies a real
  // TtsSource; for now the transport falls through to device speechSynthesis.
  const transportPage = useMemo(() => (page ? { text: page.text } : null), [page]);

  const onAutoNext = useCallback(() => {
    // Auto-turn only advances within a chapter. Chapter end is handled by the
    // page component (Slice 4+); Slice 1 just stops.
    dispatch({ type: 'nextPage' });
  }, []);

  const transport = useReaderTransport({
    page: transportPage,
    gated: false, // Slice 4+ raises this on ask/choice/breathe pages
    onAutoNext,
    isLastPage: lastPage,
  });

  const onBack = useCallback(() => {
    transport.stop();
    if (book.kind === 'chapter' && !showMap) {
      dispatch({ type: 'exitChapter' });
      return;
    }
    router.push('/read');
  }, [book.kind, showMap, router, transport]);

  const onPickChapter = useCallback((i: number) => dispatch({ type: 'enterChapter', chapterIdx: i }), []);
  const onPrev = useCallback(() => dispatch({ type: 'prevPage' }), []);
  const onNext = useCallback(() => dispatch({ type: 'nextPage' }), []);

  // Word interactions (PRD A9).
  const onHearWord = useCallback(
    (word: string, wordIdx: number) => {
      if (transport.playing) {
        transport.seekToWord(wordIdx);
      } else {
        transport.speakOne(word);
      }
    },
    [transport],
  );

  // Word save. Optimistic UI: WordCapsule blooms as soon as the tap lands;
  // failure resets. Bloom animation is auto-cleared after ~1400ms per DS spec.
  const [savedWord, setSavedWord] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const bloomTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (bloomTimer.current) clearTimeout(bloomTimer.current);
  }, []);

  const onStarWord = useCallback(
    (stem: string) => {
      setSavedWord(stem);
      setJustSaved(true);
      if (bloomTimer.current) clearTimeout(bloomTimer.current);
      bloomTimer.current = setTimeout(() => setJustSaved(false), 1400);

      saveWord({
        word: stem,
        sentence: page?.text,
        bookId: book.id,
        chapterIdx: state.chapterIdx ?? undefined,
        pageIdx: state.pageIdx,
      }).catch(() => {
        // Rollback bloom on failure — PRD C1 (audit C1 fix) — never silent-drop.
        setJustSaved(false);
        setSavedWord(null);
      });
    },
    [book.id, page?.text, state.chapterIdx, state.pageIdx],
  );

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <ReaderTopBar
        onBack={onBack}
        buddyColor="var(--teal)"
        buddyState={transport.playing ? 'speaking' : 'idle'}
        savedWord={savedWord ?? undefined}
        justSaved={justSaved}
        onWordTap={savedWord ? () => transport.speakOne(savedWord) : undefined}
      />

      {showMap && book.kind === 'chapter' ? (
        <section style={{ padding: 'var(--space-4)', display: 'grid', gap: 'var(--space-3)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: 28 }}>{book.title}</h1>
          <ChapterMap
            size="large"
            chapters={book.chapters.map((c) => ({ title: c.title, tint: c.wash }))}
            current={0}
            onPick={onPickChapter}
          />
        </section>
      ) : ch && page ? (
        <>
          <main
            style={{
              flex: 1,
              display: 'grid',
              placeItems: 'center',
              padding: 'var(--space-4)',
            }}
          >
            <div style={{ maxWidth: 620, width: '100%' }}>
              {book.kind === 'chapter' && (
                <div
                  style={{
                    fontFamily: 'var(--font-hand)',
                    color: 'var(--ink-soft)',
                    marginBottom: 'var(--space-2)',
                    textAlign: 'center',
                  }}
                >
                  {ch.title}
                </div>
              )}
              <StoryText
                words={page.words.map((w) => ({ w: w.w }))}
                currentIndex={transport.wordIdx}
                starredWords={[
                  ...(page.star ? [page.star] : []),
                  ...(savedWord ? [savedWord] : []),
                ]}
                onHearWord={onHearWord}
                onStarWord={onStarWord}
              />
            </div>
          </main>

          <footer
            style={{
              padding: 'var(--space-4)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Transport
              playing={transport.playing}
              onPlay={transport.toggle}
              onPrev={onPrev}
              onNext={onNext}
              canPrev={!isFirstPage(state)}
              canNext={!lastPage}
            />
          </footer>
        </>
      ) : null}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReaderTopBar } from '@ds/components/reader/ReaderTopBar.jsx';
import { Transport } from '@ds/components/kid/Transport.jsx';
import { useReaderTransport } from '@/lib/reader/transport';
import { pushProgress } from '@/lib/reader/progress';
import { pageAudioSource, fetchPageTimestamps } from '@/lib/reader/page-audio-source';
import type { WordTimestamp } from '@/lib/reader/speech';
import { useBedtime } from '@/lib/reader/use-bedtime';
import { useSwipeTurn } from '@/lib/reader/use-swipe-turn';
import type { BedtimeWindow } from '@/lib/models/settings';
import { MapSection } from './map-section';
import { PageSpread } from './page-spread';
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

// Reader orchestrator (client). One job: play the story.
//   Day mode  — illustrated PageSpread, day-voice narration, tap-a-word to hear it
//   Night mode — text-only pages, sleepy voice, calmer palette, no interruptions
// No comprehension gates, no word saving, no interactive branches — the whole
// experience is: story, page turn, story, page turn.

const BEDTIME_VOICE = { rate: 0.9, volume: 0.85 };

export function Reader({
  book,
  initialProgress,
  bedtimeWindow = { enabled: false, startHour: 19, endHour: 6 },
}: {
  book: ReaderBook;
  initialProgress: ProgressRecord | null;
  bedtimeWindow?: BedtimeWindow;
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    (s: ReaderState, a: ReaderAction) => reducer(book, s, a),
    initialProgress
      ? { chapterIdx: initialProgress.chapterIdx, pageIdx: initialProgress.pageIdx }
      : initialState(book),
  );

  // Debounced progress write on every state change (skip on the chapter map).
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

  // Painted-book policy: if ANY page in this book has approved scene art, a
  // page without one shows PaintingWash instead of plain paper — partially
  // arted books look intentional, never broken.
  const bookHasAnyArt = useMemo(
    () => book.chapters.some((c) => c.pages.some((p) => Boolean(p.img))),
    [book],
  );
  const useWashFallback = bookHasAnyArt && page && !page.img;

  // Day / Night mode. useBedtime() honors the settings window + a per-session
  // override toggle. In night mode: art is hidden (text-only rendering),
  // narration uses the sleepy voice cast, and the whole surface leans darker.
  const { bedtime, toggleBedtime } = useBedtime(bedtimeWindow);
  const isNight = bedtime;

  // Word timestamps for the current page — threaded into the transport so
  // `transport.speakOne(word)` finds a real offset instead of restarting.
  const [pageTimestamps, setPageTimestamps] = useState<WordTimestamp[] | null>(null);
  useEffect(() => {
    if (!page || state.chapterIdx === null) {
      setPageTimestamps(null);
      return;
    }
    let cancelled = false;
    void fetchPageTimestamps(book.id, state.chapterIdx, state.pageIdx, page.text).then((ts) => {
      if (!cancelled) setPageTimestamps(ts);
    });
    return () => {
      cancelled = true;
    };
  }, [book.id, page, state.chapterIdx, state.pageIdx]);

  const transportPage = useMemo(() => {
    if (!page || state.chapterIdx === null) return null;
    return {
      text: page.text,
      source: pageAudioSource({
        bookId: book.id,
        chapterIdx: state.chapterIdx,
        pageIdx: state.pageIdx,
      }),
      timestamps: pageTimestamps ?? undefined,
    };
  }, [book.id, page, state.chapterIdx, state.pageIdx, pageTimestamps]);

  // Post-chapter advancement. Chapter books return to their map; quick books
  // exit to Home. In night mode on the final page we hold instead of pushing
  // — the story ends where it ends, no navigation while a kid drifts.
  const advanceAfterChapter = useCallback(() => {
    if (state.chapterIdx === null) return;
    const isLastChapter = state.chapterIdx >= book.chapters.length - 1;
    if (!isLastChapter) {
      dispatch({ type: 'enterChapter', chapterIdx: state.chapterIdx + 1 });
      return;
    }
    if (isNight) return; // rest, don't push
    if (book.kind === 'chapter') {
      dispatch({ type: 'exitChapter' });
    } else {
      router.push('/read');
    }
  }, [book.chapters.length, book.kind, isNight, router, state.chapterIdx]);

  const onAutoNext = useCallback(() => {
    if (lastPage) {
      advanceAfterChapter();
      return;
    }
    dispatch({ type: 'nextPage' });
  }, [advanceAfterChapter, lastPage]);

  const transport = useReaderTransport({
    page: transportPage,
    gated: false,
    onAutoNext,
    isLastPage: lastPage,
    voiceMod: isNight ? BEDTIME_VOICE : undefined,
    voice: isNight ? 'night' : 'day',
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

  // Word interactions: tap = hear the word in the current mode's voice. That's
  // the only word-level affordance now — no popover, no save, no definition.
  const onHearWord = useCallback(
    (stem: string) => {
      transport.speakOne(stem);
    },
    [transport],
  );

  const swipe = useSwipeTurn({
    enabled: !showMap,
    onPrev,
    onNext,
  });

  return (
    <div
      style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--surface-page)', overflow: 'hidden' }}
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
    >
      <ReaderTopBar
        onBack={onBack}
        title={book.title}
        segments={ch ? { current: state.pageIdx, total: ch.pages.length } : undefined}
        buddyState={transport.playing ? 'speaking' : 'idle'}
      />

      {/* Secondary chrome: chapter jump chip (chapter books, mid-chapter)
          on the left; Day/Night toggle always on the right. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px var(--page-pad) 6px',
          flex: 'none',
          gap: 'var(--space-2)',
        }}
      >
        {book.kind === 'chapter' && state.chapterIdx !== null ? (
          <button
            type="button"
            aria-label="Back to the chapter map"
            onClick={() => {
              transport.stop();
              dispatch({ type: 'exitChapter' });
            }}
            style={{
              border: 'none',
              cursor: 'pointer',
              background: 'var(--wash-capsule)',
              backdropFilter: 'blur(14px)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 14px',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--ink-soft)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span aria-hidden>📖</span> All chapters
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          aria-label={isNight ? 'Switch to daytime reading' : 'Switch to bedtime reading'}
          aria-pressed={isNight}
          onClick={toggleBedtime}
          style={{
            border: 'none',
            cursor: 'pointer',
            background: 'var(--wash-capsule)',
            backdropFilter: 'blur(14px)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 12px',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--ink)',
            boxShadow: isNight ? '0 0 0 2px var(--marigold)' : 'none',
          }}
        >
          {isNight ? '🌙' : '☀️'}
        </button>
      </div>

      {showMap && book.kind === 'chapter' ? (
        <main style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <MapSection
            title={book.title}
            chapters={book.chapters.map((c) => ({ title: c.title, tint: c.wash }))}
            onPick={onPickChapter}
          />
        </main>
      ) : ch && page ? (
        <>
          <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <PageSpread
              page={page}
              pageKey={`${state.chapterIdx}-${state.pageIdx}`}
              chapterTitle={book.kind === 'chapter' ? ch.title : null}
              useWashFallback={Boolean(useWashFallback)}
              currentIndex={transport.wordIdx}
              narrating={transport.playing}
              coverImage={book.coverImage}
              hideArt={isNight}
              onHearWord={onHearWord}
            />
          </main>

          <footer
            style={{
              flex: 'none',
              padding: 'var(--space-3) var(--page-pad) calc(var(--space-5) + env(safe-area-inset-bottom, 0px))',
              display: 'grid',
              placeItems: 'center',
              gap: 'var(--space-3)',
              background: 'linear-gradient(to top, var(--surface-page) 60%, transparent)',
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

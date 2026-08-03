'use client';

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReaderTransport } from '@/lib/reader/transport';
import { pushProgress } from '@/lib/reader/progress';
import { pageAudioSource, fetchPageTimestamps } from '@/lib/reader/page-audio-source';
import type { WordTimestamp } from '@/lib/reader/speech';
import { bookThemeCss } from '@/lib/reader/theme';
import { useBedtime } from '@/lib/reader/use-bedtime';
import { ReaderHeader } from './reader-header';
import { ReaderFooter, type PlaybackRate } from './reader-footer';
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

  const voiceMode: 'day' | 'night' = isNight ? 'night' : 'day';

  // User-picked playback rate — persisted per browser. Night mode's own
  // slowdown (0.9) is multiplied by the user pick so both signals apply:
  //   day + 1×    = 1×
  //   night + 1×  = 0.9× (default bedtime cadence)
  //   night + 1.15× = 1.035× (kid wants faster even at bedtime)
  const [rate, setRate] = useState<PlaybackRate>(1);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('lf-reader-rate');
      const parsed = raw ? Number(raw) : NaN;
      if (parsed === 0.85 || parsed === 1 || parsed === 1.15) setRate(parsed);
    } catch {
      /* private mode */
    }
  }, []);
  const chooseRate = useCallback((next: PlaybackRate) => {
    setRate(next);
    try {
      window.localStorage.setItem('lf-reader-rate', String(next));
    } catch {
      /* ignore */
    }
  }, []);

  // Word timestamps for the current page (voice-specific).
  const [pageTimestamps, setPageTimestamps] = useState<WordTimestamp[] | null>(null);
  useEffect(() => {
    if (!page || state.chapterIdx === null) {
      setPageTimestamps(null);
      return;
    }
    let cancelled = false;
    void fetchPageTimestamps(book.id, state.chapterIdx, state.pageIdx, page.text, voiceMode).then((ts) => {
      if (!cancelled) setPageTimestamps(ts);
    });
    return () => {
      cancelled = true;
    };
  }, [book.id, page, state.chapterIdx, state.pageIdx, voiceMode]);

  const transportPage = useMemo(() => {
    if (!page || state.chapterIdx === null) return null;
    return {
      text: page.text,
      source: pageAudioSource({
        bookId: book.id,
        chapterIdx: state.chapterIdx,
        pageIdx: state.pageIdx,
        voice: voiceMode,
      }),
      timestamps: pageTimestamps ?? undefined,
    };
  }, [book.id, page, state.chapterIdx, state.pageIdx, pageTimestamps, voiceMode]);

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

  // Page-turn direction, drives the flip animation in PageSpread.
  // Kept as a ref-like state that resets on chapter enter/exit so a fresh
  // chapter doesn't inherit a stale turn.
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);

  const onAutoNext = useCallback(() => {
    if (lastPage) {
      advanceAfterChapter();
      return;
    }
    setTurnDirection('next');
    dispatch({ type: 'nextPage' });
  }, [advanceAfterChapter, lastPage]);

  // Combine baseline (night's 0.9 slowdown) with the user's rate pick.
  const effectiveRate = isNight ? BEDTIME_VOICE.rate * rate : rate;
  const effectiveVolume = isNight ? BEDTIME_VOICE.volume : undefined;
  const transport = useReaderTransport({
    page: transportPage,
    gated: false,
    onAutoNext,
    voiceMod:
      effectiveRate !== 1 || effectiveVolume !== undefined
        ? { rate: effectiveRate, volume: effectiveVolume }
        : undefined,
  });

  const onBack = useCallback(() => {
    transport.stop();
    if (book.kind === 'chapter' && !showMap) {
      dispatch({ type: 'exitChapter' });
      return;
    }
    router.push('/read');
  }, [book.kind, showMap, router, transport]);

  const onPickChapter = useCallback((i: number) => {
    setTurnDirection(null); // fresh chapter → no residual turn animation
    dispatch({ type: 'enterChapter', chapterIdx: i });
  }, []);
  const onPrev = useCallback(() => {
    setTurnDirection('prev');
    dispatch({ type: 'prevPage' });
  }, []);
  const onNext = useCallback(() => {
    setTurnDirection('next');
    dispatch({ type: 'nextPage' });
  }, []);

  // Word interactions:
  //   playing → seek to the tapped word and continue narrating from there
  //   paused  → speak the word once AND park the highlight there, so the
  //             next play press picks up from that word
  const onHearWord = useCallback(
    (word: string, wordIdx: number) => {
      if (transport.playing) {
        transport.seekToWord(wordIdx);
      } else {
        transport.speakOne(word, wordIdx);
      }
    },
    [transport],
  );

  const swipe = useSwipeTurn({
    enabled: !showMap,
    onPrev,
    onNext,
  });

  // Per-book atmosphere: emit scoped CSS overrides via useMemo so the
  // recompute is cheap and the string is stable across renders. Selector
  // gates on data-mode!="night" so bedtime always wins.
  const themeCss = useMemo(() => bookThemeCss(book.id, book.theme), [book.id, book.theme]);

  return (
    <div
      data-book-id={book.id}
      data-mode={isNight ? 'night' : 'day'}
      style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--surface-page)', overflow: 'hidden' }}
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
    >
      {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      <ReaderHeader
        bookTitle={book.title}
        chapterTitle={book.kind === 'chapter' && ch ? ch.title : null}
        segments={ch ? { current: state.pageIdx, total: ch.pages.length } : undefined}
        isNight={isNight}
        onBack={onBack}
        onToggleMode={toggleBedtime}
        onBackToMap={
          book.kind === 'chapter' && state.chapterIdx !== null
            ? () => {
                transport.stop();
                dispatch({ type: 'exitChapter' });
              }
            : null
        }
      />

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
              turnDirection={turnDirection}
              onHearWord={onHearWord}
            />
          </main>

          <ReaderFooter
            playing={transport.playing}
            canPrev={!isFirstPage(state)}
            canNext={!lastPage}
            onPlay={transport.toggle}
            onPrev={onPrev}
            onNext={onNext}
            onRestartPage={() => transport.seekToWord(0)}
            rate={rate}
            onCycleRate={chooseRate}
          />
        </>
      ) : null}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReaderTransport } from '@/lib/reader/transport';
import { pushProgress } from '@/lib/reader/progress';
import { pageAudioSource, fetchPageTimestamps } from '@/lib/reader/page-audio-source';
import type { WordTimestamp } from '@/lib/reader/speech';
import { bookThemeCss } from '@/lib/reader/theme';
import { useBedtime } from '@/lib/reader/use-bedtime';
import { Wordmark } from '@ds/components/core/Wordmark.jsx';
import { ReaderChip } from './reader-chip';
import { ReaderPill } from './reader-pill';
import { ReaderMenu, type PlaybackRate } from './reader-menu';
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
  const [menuOpen, setMenuOpen] = useState(false);
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
  const onAutoNext = useCallback(() => {
    if (lastPage) {
      advanceAfterChapter();
      return;
    }
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

  const onPickChapter = useCallback((i: number) => {
    dispatch({ type: 'enterChapter', chapterIdx: i });
  }, []);
  const onPrev = useCallback(() => {
    dispatch({ type: 'prevPage' });
  }, []);
  const onNext = useCallback(() => {
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
      style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--surface-page)', overflow: 'hidden', position: 'relative' }}
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
    >
      {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}

      <ReaderChip isNight={isNight} onToggle={toggleBedtime} />

      {showMap && book.kind === 'chapter' ? (
        <main style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <MapSection
            title={book.title}
            chapters={book.chapters.map((c) => ({ title: c.title, tint: c.wash }))}
            onPick={onPickChapter}
          />
        </main>
      ) : ch && page ? (
        <PageSpread
          page={page}
          pageKey={`${state.chapterIdx}-${state.pageIdx}`}
          useWashFallback={Boolean(useWashFallback)}
          currentIndex={transport.wordIdx}
          narrating={transport.playing}
          coverImage={book.coverImage}
          hideArt={isNight}
          onHearWord={onHearWord}
          controls={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Menu"
                style={{
                  border: '1px solid var(--pill-edge)',
                  background: 'var(--wash-capsule)',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  flex: 'none',
                  boxShadow: 'var(--shadow-rest)',
                  padding: 0,
                }}
              >
                <Wordmark layout="mark-only" markSize={22} />
              </button>
              <ReaderPill
                playing={transport.playing}
                canPrev={!isFirstPage(state)}
                canNext={!lastPage}
                onPlay={transport.toggle}
                onPrev={onPrev}
                onNext={onNext}
                label={book.kind === 'chapter' && ch ? ch.title : book.title}
                progress={page.words.length > 1 ? transport.wordIdx / (page.words.length - 1) : null}
              />
            </div>
          }
        />
      ) : null}

      <ReaderMenu
        open={menuOpen}
        bookTitle={book.title}
        chapters={book.kind === 'chapter' ? book.chapters.map((c) => ({ title: c.title })) : null}
        currentChapter={state.chapterIdx}
        rate={rate}
        onRate={chooseRate}
        onPickChapter={onPickChapter}
        onLibrary={() => {
          transport.stop();
          router.push('/read');
        }}
        onClose={() => setMenuOpen(false)}
      />
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReaderTransport } from '@/lib/reader/transport';
import { pushProgress } from '@/lib/reader/progress';
import { pageAudioSource, fetchPageTimestamps } from '@/lib/reader/page-audio-source';
import type { WordTimestamp } from '@/lib/reader/speech';
import { bookThemeCss } from '@/lib/reader/theme';
import { useBedtime } from '@/lib/reader/use-bedtime';
import { Menu } from 'lucide-react';
import { ReaderChip } from './reader-chip';
import { ReaderPill } from './reader-pill';
import { ReaderMenu, type PlaybackRate } from './reader-menu';
import { useSwipeTurn } from '@/lib/reader/use-swipe-turn';
import type { BedtimeWindow } from '@/lib/models/settings';
import { PageSpread } from './page-spread';
import { CoverPage, EndPage } from './book-ends';
import { SampleClosingCard } from './sample-closing-card';
import { ChapterOpener, useChapterOpenerVisible } from './chapter-opener';
import type { ReaderMenuChapter } from './reader-menu';
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
  sample = false,
  shareable = false,
  libraryHref = '/read',
}: {
  book: ReaderBook;
  initialProgress: ProgressRecord | null;
  bedtimeWindow?: BedtimeWindow;
  // True when the reader was opened via /sample. The story plays exactly
  // the same; only the end-of-book surface changes (closing card instead
  // of the install prompt).
  sample?: boolean;
  // Household surface only: enables the menu's share actions, which mint
  // /share links via the child-device session. Share/sample visitors have
  // no such session, so the section is hidden for them.
  shareable?: boolean;
  // Where "Choose another story" goes. Null hides the button (a single-book
  // share has no shelf to return to).
  libraryHref?: string | null;
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    (s: ReaderState, a: ReaderAction) => reducer(book, s, a),
    initialProgress
      ? { chapterIdx: initialProgress.chapterIdx, pageIdx: initialProgress.pageIdx }
      : initialState(book),
  );

  // The book's boards. Every open starts at the cover (a shared link lands a
  // stranger straight in a story — the cover introduces it as a book first);
  // past the last page sits the closing leaf with the mark. Saved progress
  // still applies: turning past the cover resumes wherever the child left off.
  const [surface, setSurface] = useState<'cover' | 'story' | 'end'>('cover');
  // Set when a play press should carry across a surface change (play on the
  // cover = open the book and start reading).
  const [pendingPlay, setPendingPlay] = useState(false);

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
  const lastPage = isLastPage(book, state);

  // Chapter cards for the menu overlay — includes a thumbnail (first
  // illustrated page in the chapter, or the book cover as a fallback) and
  // page count. Recomputed only when the book itself changes.
  const menuChapters = useMemo<ReaderMenuChapter[] | null>(() => {
    if (book.kind !== 'chapter') return null;
    return book.chapters.map((c) => ({
      title: c.title,
      pageCount: c.pages.length,
      thumbnail: c.pages.find((p) => p.img)?.img ?? book.coverImage ?? null,
    }));
  }, [book]);

  // Chapter-opener fade-in state. Owned here (not in ChapterOpener) so
  // the reader pill can echo the same signal — pill shows book title
  // while the opener caption is up, then falls back to chapter title.
  const openerVisible = useChapterOpenerVisible({
    chapterIdx: state.chapterIdx,
    pageIdx: state.pageIdx,
    chapterCount: book.chapters.length,
  });
  const pillLabel =
    book.kind === 'chapter' && ch && !openerVisible ? ch.title : book.title;

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
    if (!page || state.chapterIdx === null || surface !== 'story') return null;
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
  }, [book.id, page, state.chapterIdx, state.pageIdx, pageTimestamps, voiceMode, surface]);

  // Post-chapter advancement. Mid-book, roll into the next chapter; after the
  // final chapter, turn onto the closing leaf. In night mode we hold instead —
  // the story ends where it ends, no navigation while a kid drifts.
  const advanceAfterChapter = useCallback(() => {
    if (state.chapterIdx === null) return;
    const isLastChapter = state.chapterIdx >= book.chapters.length - 1;
    if (!isLastChapter) {
      dispatch({ type: 'enterChapter', chapterIdx: state.chapterIdx + 1 });
      return;
    }
    if (isNight) return; // rest, don't push
    setSurface('end');
  }, [book.chapters.length, isNight, state.chapterIdx]);

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

  // Carry a play press across a surface change: play on the cover (or "play
  // again" on the closing leaf) opens the book and starts reading once the
  // page's transport is live.
  useEffect(() => {
    if (surface !== 'story' || !pendingPlay || !transportPage) return;
    setPendingPlay(false);
    transport.play();
  }, [surface, pendingPlay, transportPage, transport]);

  const onPlayPress = useCallback(() => {
    if (surface === 'cover') {
      setSurface('story');
      setPendingPlay(true);
      return;
    }
    if (surface === 'end') {
      dispatch({ type: 'goToPage', chapterIdx: 0, pageIdx: 0 });
      setSurface('story');
      setPendingPlay(true);
      return;
    }
    transport.toggle();
  }, [surface, transport]);

  const onPickChapter = useCallback((i: number) => {
    dispatch({ type: 'enterChapter', chapterIdx: i });
    setSurface('story'); // a chapter pick from the cover or closing leaf opens the book
  }, []);
  const onFirstBookPage = isFirstPage(state) && (state.chapterIdx ?? 0) === 0;
  const onLastBookPage =
    lastPage && (state.chapterIdx === null || state.chapterIdx >= book.chapters.length - 1);

  // Manual paging runs cover → every page of every chapter → closing leaf,
  // in both directions. Chapter boundaries don't stop the arrows: the last
  // page's › lands on the next chapter's first page (where the opener
  // caption announces the break), and page one's ‹ steps back onto the
  // previous chapter's final page.
  const onPrev = useCallback(() => {
    if (surface === 'cover') return;
    if (surface === 'end') {
      setSurface('story');
      return;
    }
    if (onFirstBookPage) {
      setSurface('cover');
      return;
    }
    if (state.chapterIdx !== null && state.chapterIdx > 0 && state.pageIdx === 0) {
      const prevCh = book.chapters[state.chapterIdx - 1];
      dispatch({
        type: 'goToPage',
        chapterIdx: state.chapterIdx - 1,
        pageIdx: Math.max(0, (prevCh?.pages.length ?? 1) - 1),
      });
      return;
    }
    dispatch({ type: 'prevPage' });
  }, [book.chapters, onFirstBookPage, state.chapterIdx, state.pageIdx, surface]);
  const onNext = useCallback(() => {
    if (surface === 'cover') {
      setSurface('story');
      return;
    }
    if (surface === 'end') return;
    if (onLastBookPage) {
      setSurface('end');
      return;
    }
    if (lastPage && state.chapterIdx !== null && state.chapterIdx < book.chapters.length - 1) {
      dispatch({ type: 'enterChapter', chapterIdx: state.chapterIdx + 1 });
      return;
    }
    dispatch({ type: 'nextPage' });
  }, [book.chapters.length, lastPage, onLastBookPage, state.chapterIdx, surface]);

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
    enabled: Boolean(ch && page),
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

      {ch && page ? (
        (() => {
          const controls = (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
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
                  color: 'var(--ink)',
                  cursor: 'pointer',
                }}
              >
                <Menu size={20} strokeWidth={1.8} aria-hidden="true" />
              </button>
              <ReaderPill
                playing={surface === 'story' && transport.playing}
                canPrev={surface !== 'cover'}
                canNext={surface !== 'end'}
                onPlay={onPlayPress}
                onPrev={onPrev}
                onNext={onNext}
                label={surface === 'story' ? pillLabel : book.title}
                progress={
                  surface === 'story' && page.words.length > 1
                    ? transport.wordIdx / (page.words.length - 1)
                    : null
                }
              />
            </div>
          );
          if (surface === 'cover') {
            return (
              <CoverPage
                title={book.title}
                art={book.coverImage ?? book.chapters[0]?.pages.find((p) => p.img)?.img}
                isNight={isNight}
                onOpen={() => setSurface('story')}
                controls={controls}
              />
            );
          }
          if (surface === 'end') {
            return (
              <EndPage
                onReadAgain={() => {
                  dispatch({ type: 'goToPage', chapterIdx: 0, pageIdx: 0 });
                  setSurface('cover');
                }}
                controls={controls}
              />
            );
          }
          return (
            <PageSpread
              page={page}
              pageKey={`${state.chapterIdx}-${state.pageIdx}`}
              useWashFallback={Boolean(useWashFallback)}
              currentIndex={transport.wordIdx}
              narrating={transport.playing}
              coverImage={book.coverImage}
              hideArt={isNight}
              onHearWord={onHearWord}
              controls={controls}
            />
          );
        })()
      ) : null}

      <ChapterOpener
        visible={openerVisible && surface === 'story'}
        chapterIdx={state.chapterIdx}
        chapterTitle={ch?.title ?? ''}
      />

      {sample && <SampleClosingCard visible={surface === 'end'} />}

      <ReaderMenu
        open={menuOpen}
        bookTitle={book.title}
        chapters={menuChapters}
        currentChapter={state.chapterIdx}
        rate={rate}
        onRate={chooseRate}
        onPickChapter={onPickChapter}
        shareBookId={shareable ? book.id : null}
        onLibrary={
          libraryHref
            ? () => {
                transport.stop();
                router.push(libraryHref);
              }
            : null
        }
        onClose={() => setMenuOpen(false)}
      />
    </div>
  );
}

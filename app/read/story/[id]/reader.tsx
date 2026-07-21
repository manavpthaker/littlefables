'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReaderTopBar } from '@ds/components/reader/ReaderTopBar.jsx';
import { ChapterMap } from '@ds/components/reader/ChapterMap.jsx';
import { Transport } from '@ds/components/kid/Transport.jsx';
import { Button } from '@ds/components/core/Button.jsx';
import { useReaderTransport } from '@/lib/reader/transport';
import { useWordSave } from '@/lib/reader/use-word-save';
import { pushProgress } from '@/lib/reader/progress';
import { useRecapOnResume } from '@/lib/reader/use-recap';
import { useArtPrefetch } from '@/lib/reader/use-art-prefetch';
import { pageAudioSource, fetchPageTimestamps } from '@/lib/reader/page-audio-source';
import type { WordTimestamp } from '@/lib/reader/speech';
import { Celebrations } from '@/app/read/celebrations';
import { StateBannerBoot } from '@/app/read/state-banner';
import { speakUtterance } from '@/lib/voice/ui-voice';
import { useBedtime } from '@/lib/reader/use-bedtime';
import type { BedtimeWindow } from '@/lib/models/settings';
import { Checkpoint } from './checkpoint';
import { PageSpread } from './page-spread';
import { InteractivePage } from './interactive-page';
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

const BEDTIME_VOICE = { rate: 0.9, volume: 0.85 };
const BEDTIME_RESOLVE_LINE = 'Safe and cozy. The end for tonight.';

export function Reader({
  book,
  initialProgress,
  buddyEmoji,
  buddyColor = 'var(--teal)',
  bedtimeWindow = { enabled: false, startHour: 19, endHour: 6 },
  checksEnabled = true,
}: {
  book: ReaderBook;
  initialProgress: ProgressRecord | null;
  buddyEmoji?: string;
  buddyColor?: string;
  bedtimeWindow?: BedtimeWindow;
  checksEnabled?: boolean;
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

  // Coming back after ≥24h: spoken orientation. Next pages' approved art:
  // warmed while this one is read, so page turns never flash the wash.
  useRecapOnResume(book, initialProgress);
  useArtPrefetch(book, state);

  const ch = currentChapter(book, state);
  const page = currentPage(book, state);
  const showMap = state.chapterIdx === null;
  const lastPage = isLastPage(book, state);

  // Painted-book policy: if ANY page in this book has approved scene art, a
  // page without one shows PaintingWash instead of plain paper — partially
  // arted books look intentional (art still developing), never broken.
  const bookHasAnyArt = useMemo(
    () => book.chapters.some((c) => c.pages.some((p) => Boolean(p.img))),
    [book],
  );
  const useWashFallback = bookHasAnyArt && page && !page.img;

  // Interactive page detection — PRD A4. Gates the transport (transport won't
  // auto-turn while the child is choosing / breathing / answering).
  const isInteractive = Boolean(page && (page.choice || page.ask || page.breathe));

  // Bedtime (redesign brief §III.3): night tokens + slower/lower narration +
  // resolving chapter ends instead of questions.
  const { bedtime, toggleBedtime } = useBedtime(bedtimeWindow);
  const checksActive = checksEnabled && !bedtime;

  // Comprehension gate. Set when narration ends on the last page of a chapter.
  // Cleared when the child moves on (either mercy or accept).
  const [inCheckpoint, setInCheckpoint] = useState(false);
  const chapterKey = `${book.id}:${state.chapterIdx ?? 'none'}`;
  const seenCheckpoint = useRef(new Set<string>());

  // Word timestamps for the current page — threaded into transportPage so
  // `transport.seekToWord()` finds a real audio offset (via `page.timestamps`)
  // and jumps within playback instead of restarting at word 0. Null while
  // fetching, or when audio isn't available (speechSynth fallback path).
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

  // Feed the current page's text + layered TtsSource + timestamps into the
  // transport. Any layer failure falls through to speechSynth; missing
  // timestamps mean seek restarts the page (acceptable fallback).
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

  // Post-chapter advancement, shared by the checkpoint's onDone and the
  // no-checkpoint paths (bedtime / checks off).
  const advanceAfterChapter = useCallback(() => {
    if (state.chapterIdx === null) return;
    const isLastChapter = state.chapterIdx >= book.chapters.length - 1;
    if (!isLastChapter) {
      dispatch({ type: 'enterChapter', chapterIdx: state.chapterIdx + 1 });
      return;
    }
    // Chapter books return to their map; quick books go back to Home.
    if (book.kind === 'chapter') {
      dispatch({ type: 'exitChapter' });
    } else {
      transportRef.current?.stop();
      router.push('/read');
    }
  }, [book.chapters.length, book.kind, router, state.chapterIdx]);

  const onAutoNext = useCallback(() => {
    // Auto-turn only advances within a chapter. Chapter end transitions into
    // the checkpoint — or, in bedtime / checks-off, resolves and moves on.
    if (lastPage) {
      if (seenCheckpoint.current.has(chapterKey)) return;
      seenCheckpoint.current.add(chapterKey);
      if (checksActive) {
        setInCheckpoint(true);
        return;
      }
      if (bedtime) {
        // Resolve, never cliffhang (brief §III.3): one settling line, then a
        // calm stop — no question, no navigation while he drifts off.
        void speakUtterance(BEDTIME_RESOLVE_LINE, { voice: 'narrator', priority: 'checkpoint' });
        return;
      }
      advanceAfterChapter();
      return;
    }
    dispatch({ type: 'nextPage' });
  }, [lastPage, chapterKey, checksActive, bedtime, advanceAfterChapter]);

  const transport = useReaderTransport({
    page: transportPage,
    gated: inCheckpoint || isInteractive, // pauses narration during interactivity
    onAutoNext,
    isLastPage: lastPage,
    voiceMod: bedtime ? BEDTIME_VOICE : undefined,
  });
  // advanceAfterChapter needs stop() but is declared before the transport —
  // a ref breaks the cycle without re-ordering the hooks.
  const transportRef = useRef<typeof transport | null>(null);
  transportRef.current = transport;

  // Interactive-page callbacks. Choices write to the buddy's choice_log via
  // the world API; breathe just advances; ask advances (voice-answer flow can
  // reuse the Checkpoint pipeline later — deferred).
  const onChoice = useCallback(
    (label: string, summary: string) => {
      if (state.chapterIdx === null) return;
      // Fire-and-forget — the sync outbox handles offline.
      void fetch('/api/child/choice', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          chapterIdx: state.chapterIdx,
          label,
          summary,
        }),
      });
      dispatch({ type: 'nextPage' });
    },
    [book.id, state.chapterIdx],
  );
  const onBreatheDone = useCallback(() => dispatch({ type: 'nextPage' }), []);
  const onAskContinue = useCallback(() => dispatch({ type: 'nextPage' }), []);

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

  // Word save (PRD A9) — extracted to lib/reader/use-word-save.ts.
  const [pendingBadges, setPendingBadges] = useState<string[]>([]);
  const { savedWord, justSaved, onStarWord } = useWordSave({
    book,
    pageText: page?.text,
    chapterIdx: state.chapterIdx,
    pageIdx: state.pageIdx,
    onBadges: (slugs) => setPendingBadges((prev) => [...prev, ...slugs]),
  });

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--surface-page)' }}>
      <ReaderTopBar
        onBack={onBack}
        buddyColor={buddyColor}
        buddyEmoji={buddyEmoji}
        buddyState={transport.playing ? 'speaking' : 'idle'}
        savedWord={savedWord ?? undefined}
        justSaved={justSaved}
        onWordTap={savedWord ? () => transport.speakOne(savedWord) : undefined}
        bedtime={bedtime}
        onBedtime={toggleBedtime}
      />
      <Celebrations newlyEarned={pendingBadges} />
      <StateBannerBoot />

      {inCheckpoint && state.chapterIdx !== null && ch ? (
        <Checkpoint
          bookId={book.id}
          chapterIdx={state.chapterIdx}
          chapterTitle={ch.title}
          buddyColor={buddyColor}
          buddyEmoji={buddyEmoji}
          onDone={(result) => {
            setInCheckpoint(false);
            if (result?.newlyEarned?.length) {
              setPendingBadges((prev) => [...prev, ...(result.newlyEarned ?? [])]);
            }
            advanceAfterChapter();
          }}
        />
      ) : null}

      {showMap && book.kind === 'chapter' ? (
        <section
          style={{
            padding: 'var(--space-7) var(--page-pad) var(--space-6)',
            display: 'grid',
            gap: 'var(--space-5)',
            maxWidth: 720,
            width: '100%',
            marginInline: 'auto',
          }}
        >
          <header style={{ display: 'grid', gap: 'var(--space-2)', justifyItems: 'center', textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'var(--font-hand)',
                color: 'var(--text-muted)',
                margin: 0,
                fontSize: 'var(--text-hand)',
              }}
            >
              Pick a chapter to start
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                margin: 0,
                fontSize: 'var(--text-display)',
                lineHeight: 'var(--lh-display)',
                color: 'var(--text-strong)',
              }}
            >
              {book.title}
            </h1>
          </header>
          <ChapterMap
            size="large"
            chapters={book.chapters.map((c) => ({ title: c.title, tint: c.wash }))}
            current={0}
            onPick={onPickChapter}
          />
        </section>
      ) : ch && page && isInteractive && state.chapterIdx !== null ? (
        <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 'var(--space-6) var(--page-pad)' }}>
          <InteractivePage
            page={page}
            bookId={book.id}
            chapterIdx={state.chapterIdx}
            pageIdx={state.pageIdx}
            onChoice={onChoice}
            onBreatheDone={onBreatheDone}
            onAsk={onAskContinue}
          />
        </main>
      ) : ch && page ? (
        <>
          {/* Orientation-aware page layout (PRD F2): portrait = art behind +
              panel; landscape ≥640px = side-by-side book spread. */}
          <PageSpread
            page={page}
            pageKey={`${state.chapterIdx}-${state.pageIdx}`}
            chapterTitle={book.kind === 'chapter' ? ch.title : null}
            useWashFallback={Boolean(useWashFallback)}
            currentIndex={transport.wordIdx}
            starredWords={[
              ...(page.star ? [page.star] : []),
              ...(savedWord ? [savedWord] : []),
            ]}
            onHearWord={onHearWord}
            onStarWord={onStarWord}
          />

          <footer
            style={{
              padding: 'var(--space-4) var(--page-pad) var(--space-6)',
              display: 'grid',
              placeItems: 'center',
              gap: 'var(--space-3)',
              minHeight: 'var(--reach-zone)',
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
            {/* Silent-reader completion: the checkpoint auto-fires only when
                narration ends (transport.onEnd on the last page). Kids who
                read the page themselves without ever pressing play never
                triggered onEnd → could never finish a chapter. This affordance
                lets them signal they're done. */}
            {lastPage && !transport.playing && !inCheckpoint &&
              (checksActive ? !seenCheckpoint.current.has(chapterKey) : true) && (
              <Button
                variant="primary"
                size="primary"
                icon="check"
                utterance="Done with this chapter"
                onClick={() => {
                  transport.stop();
                  seenCheckpoint.current.add(chapterKey);
                  if (checksActive) setInCheckpoint(true);
                  else advanceAfterChapter();
                }}
              >
                Done with this chapter
              </Button>
            )}
          </footer>
        </>
      ) : null}
    </div>
  );
}

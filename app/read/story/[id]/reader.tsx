'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReaderTopBar } from '@ds/components/reader/ReaderTopBar.jsx';
import { ChapterMap } from '@ds/components/reader/ChapterMap.jsx';
import { StoryText } from '@ds/components/reader/StoryText.jsx';
import { Transport } from '@ds/components/kid/Transport.jsx';
import { Button } from '@ds/components/core/Button.jsx';
import { useReaderTransport } from '@/lib/reader/transport';
import { saveWord } from '@/lib/reader/wordbook';
import { pushProgress } from '@/lib/reader/progress';
import { pageAudioSource, fetchPageTimestamps } from '@/lib/reader/page-audio-source';
import type { WordTimestamp } from '@/lib/reader/speech';
import { Celebrations } from '@/app/read/celebrations';
import { StateBannerBoot } from '@/app/read/state-banner';
import { speakUtterance } from '@/lib/voice/ui-voice';
import { Checkpoint } from './checkpoint';
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

  // Interactive page detection — PRD A4. Gates the transport (transport won't
  // auto-turn while the child is choosing / breathing / answering).
  const isInteractive = Boolean(page && (page.choice || page.ask || page.breathe));

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

  const onAutoNext = useCallback(() => {
    // Auto-turn only advances within a chapter. Chapter end is handled by
    // useEffect below (transitions into checkpoint mode).
    if (lastPage) {
      if (!seenCheckpoint.current.has(chapterKey)) {
        seenCheckpoint.current.add(chapterKey);
        setInCheckpoint(true);
      }
      return;
    }
    dispatch({ type: 'nextPage' });
  }, [lastPage, chapterKey]);

  const transport = useReaderTransport({
    page: transportPage,
    gated: inCheckpoint || isInteractive, // pauses narration during interactivity
    onAutoNext,
    isLastPage: lastPage,
  });

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

  // Word save. Optimistic UI: WordCapsule blooms as soon as the tap lands;
  // failure resets. Bloom animation is auto-cleared after ~1400ms per DS spec.
  const [savedWord, setSavedWord] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const bloomTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (bloomTimer.current) clearTimeout(bloomTimer.current);
  }, []);

  const [pendingBadges, setPendingBadges] = useState<string[]>([]);
  const onStarWord = useCallback(
    (stem: string) => {
      setSavedWord(stem);
      setJustSaved(true);
      if (bloomTimer.current) clearTimeout(bloomTimer.current);
      bloomTimer.current = setTimeout(() => setJustSaved(false), 1400);
      // Confirm the save aloud in the buddy voice.
      void speakUtterance(`${stem} is in your word book!`, { voice: 'buddy' });

      saveWord({
        word: stem,
        sentence: page?.text,
        bookId: book.id,
        chapterIdx: state.chapterIdx ?? undefined,
        pageIdx: state.pageIdx,
      })
        .then((res) => {
          if (res && res.newlyEarned.length) {
            setPendingBadges((prev) => [...prev, ...res.newlyEarned]);
          }
          // res === null means the write is queued for later (offline). The
          // optimistic bloom stays; sync banner surfaces the pending state.
        })
        .catch(() => {
          // Rollback bloom on failure — PRD C1 (audit C1 fix) — never silent-drop.
          setJustSaved(false);
          setSavedWord(null);
        });
    },
    [book.id, page?.text, state.chapterIdx, state.pageIdx],
  );

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--surface-page)' }}>
      <ReaderTopBar
        onBack={onBack}
        buddyColor="var(--teal)"
        buddyState={transport.playing ? 'speaking' : 'idle'}
        savedWord={savedWord ?? undefined}
        justSaved={justSaved}
        onWordTap={savedWord ? () => transport.speakOne(savedWord) : undefined}
      />
      <Celebrations newlyEarned={pendingBadges} />
      <StateBannerBoot />

      {inCheckpoint && state.chapterIdx !== null && ch ? (
        <Checkpoint
          bookId={book.id}
          chapterIdx={state.chapterIdx}
          chapterTitle={ch.title}
          onDone={(result) => {
            setInCheckpoint(false);
            if (result?.newlyEarned?.length) {
              setPendingBadges((prev) => [...prev, ...(result.newlyEarned ?? [])]);
            }
            // Advance to next chapter, or fall through per book kind.
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
              transport.stop();
              router.push('/read');
            }
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
          <main
            style={{
              flex: 1,
              display: 'grid',
              placeItems: 'center',
              padding: 'var(--space-6) var(--page-pad)',
              background: page.img ? `url(${page.img}) center/cover no-repeat` : undefined,
              position: 'relative',
            }}
          >
            {page.img && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(70,54,42,0.15), rgba(70,54,42,0.05) 40%, transparent 60%)',
                  pointerEvents: 'none',
                }}
              />
            )}
            <article
              style={{
                maxWidth: 640,
                width: '100%',
                background: page.img ? 'var(--wash-panel)' : 'transparent',
                backdropFilter: page.img ? 'blur(6px)' : undefined,
                padding: page.img ? 'var(--space-5) var(--space-6)' : 0,
                borderRadius: page.img ? 'var(--radius-lg)' : 0,
                boxShadow: page.img ? 'var(--elev-card)' : 'none',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {book.kind === 'chapter' && (
                <p
                  style={{
                    fontFamily: 'var(--font-hand)',
                    color: 'var(--text-muted)',
                    margin: '0 0 var(--space-4)',
                    textAlign: 'center',
                    fontSize: 'var(--text-hand)',
                  }}
                >
                  {ch.title}
                </p>
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
                overArt={Boolean(page.img)}
              />
            </article>
          </main>

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
            {lastPage && !transport.playing && !inCheckpoint && !seenCheckpoint.current.has(chapterKey) && (
              <Button
                variant="primary"
                size="primary"
                icon="check"
                utterance="Done with this chapter"
                onClick={() => {
                  transport.stop();
                  seenCheckpoint.current.add(chapterKey);
                  setInCheckpoint(true);
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

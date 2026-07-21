'use client';

// v3 Drawn Room reader transport — the media-player brain per PRD §A3.
// Ported verbatim from `../little-fables [archive]/lib/read/useReaderTransport.ts`.
// Only the speech import path was updated to `@/lib/reader/speech`.
//
// Owns:
//   - play / pause state (never navigates)
//   - active word highlight, driven by real audio timestamps when available
//     (or a synthetic tick when we fall through to speechSynth)
//   - auto-turn logic: page narrates → 1.5s breath → onNext (continuous play)
//   - "handControlToChild" gate — ask / choice / breathe pause playback
//   - word-tap seek: restarts speak() at `startOffset`
//   - word-hold: speaks the single word (+ meaning if star), no seek, no state
//     mutation on the main narration
//
// The hook is deliberately dumb about page content — the page owns navigation
// (onNext / onPrev) and tells the hook when interactive gates are active. That
// keeps §A3's "prev/next never plays, play never navigates" invariant clean.

import { useCallback, useEffect, useRef, useState } from 'react';
import { speak, type SpeakHandle, type TtsSource, type WordTimestamp } from '@/lib/reader/speech';
import { setNarrationActive } from '@/lib/voice/ui-voice';

interface PageAudio {
  /** Pre-generated audio TtsSource — usually a static-file source. */
  source?: TtsSource;
  /** Timestamps to make word-tap seek possible without a full network fetch. */
  timestamps?: WordTimestamp[];
  /** Text to narrate (falls through to speechSynth if `source` errors). */
  text: string;
}

interface Options {
  /** Current page's audio + text. */
  page: PageAudio | null;
  /** Truthy while an interactive block is showing (ask/choice/breathe). Playback pauses. */
  gated: boolean;
  /** Called when auto-turn wants to advance to the next page. */
  onAutoNext: () => void;
  /** True if this page is the last page of the chapter — auto-turn just stops. */
  isLastPage: boolean;
  /** Prosody override (bedtime: {rate:0.9, volume:0.85}). Applies to page
   *  narration and single-word speech alike. */
  voiceMod?: { rate?: number; volume?: number };
}

export interface ReaderTransport {
  playing: boolean;
  /** -1 when nothing highlighted. */
  wordIdx: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  /** Seek to `wordIdx` and continue playing from there. */
  seekToWord: (wordIdx: number) => void;
  /** Speak a single word (+ meaning) — no seek, no state change to main narration. */
  speakOne: (word: string, meaning?: string) => void;
  /** Force a hard stop (used on page nav / unmount). */
  stop: () => void;
}

/** 1.5s breath between pages in play mode (§A3). */
const AUTO_TURN_DELAY_MS = 1500;

export function useReaderTransport({ page, gated, onAutoNext, isLastPage, voiceMod }: Options): ReaderTransport {
  const [playing, setPlaying] = useState(false);
  const [wordIdx, setWordIdx] = useState(-1);

  // Priority rule: UI speech (buddy greetings, checkpoint questions,
  // celebrations) never rides over narration. See lib/voice/ui-voice.ts.
  useEffect(() => { setNarrationActive(playing); }, [playing]);

  const handleRef = useRef<SpeakHandle | null>(null);
  const autoTurnRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoTurn = useCallback(() => {
    if (autoTurnRef.current) {
      clearTimeout(autoTurnRef.current);
      autoTurnRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    handleRef.current?.cancel();
    handleRef.current = null;
    clearAutoTurn();
    setWordIdx(-1);
    setPlaying(false);
  }, [clearAutoTurn]);

  // Play from the beginning (or from startOffsetSec if provided).
  const startPlayback = useCallback(
    (startOffsetSec?: number, startWordIdx?: number) => {
      if (!page) return;
      handleRef.current?.cancel();
      clearAutoTurn();
      setWordIdx(startWordIdx ?? -1);
      setPlaying(true);

      handleRef.current = speak(page.text, {
        source: page.source,
        allowSpeechSynthFallback: true,
        continuous: true,
        startOffset: startOffsetSec,
        rate: voiceMod?.rate,
        volume: voiceMod?.volume,
        onWord: (i) => setWordIdx(i),
        onBlocked: () => {
          // iOS refused to start playback outside a user gesture (auto-turn
          // fires from a timer). Do NOT auto-turn — that silently races pages.
          // Pause and keep position so the next tap of the terracotta play
          // (a real gesture) resumes narration from here.
          clearAutoTurn();
          setPlaying(false);
        },
        onEnd: () => {
          setWordIdx(-1);
          if (isLastPage) {
            setPlaying(false);
            return;
          }
          autoTurnRef.current = setTimeout(() => {
            autoTurnRef.current = null;
            onAutoNext();
          }, AUTO_TURN_DELAY_MS);
        },
      });
    },
    [page, clearAutoTurn, isLastPage, onAutoNext, voiceMod],
  );

  const play = useCallback(() => {
    if (!page) return;
    if (playing) return;
    startPlayback();
  }, [page, playing, startPlayback]);

  const pause = useCallback(() => {
    handleRef.current?.cancel();
    handleRef.current = null;
    clearAutoTurn();
    setPlaying(false);
    // Keep wordIdx so the visual highlight persists at the pause point.
  }, [clearAutoTurn]);

  const toggle = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, play, pause]);

  const seekToWord = useCallback(
    (targetIdx: number) => {
      if (!page) return;
      const ts = page.timestamps;
      const t = ts && ts[targetIdx] ? ts[targetIdx].start : undefined;
      startPlayback(t, targetIdx);
    },
    [page, startPlayback],
  );

  // speakOne — deliberately uses a fresh speak() handle that DOESN'T touch
  // the main narration state.
  const speakOneRef = useRef<SpeakHandle | null>(null);
  const speakOne = useCallback(
    (word: string, meaning?: string) => {
      pause();
      speakOneRef.current?.cancel();
      const utterance = meaning ? `${word}. ${word} means ${meaning}.` : word;
      speakOneRef.current = speak(utterance, {
        allowSpeechSynthFallback: true,
        rate: voiceMod?.rate,
        volume: voiceMod?.volume,
      });
    },
    [pause, voiceMod],
  );

  // Whenever the active page changes, reset transport.
  useEffect(() => {
    handleRef.current?.cancel();
    handleRef.current = null;
    speakOneRef.current?.cancel();
    speakOneRef.current = null;
    clearAutoTurn();
    setWordIdx(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Continuous play mode: when `playing` is true, gates are down, and a page
  // is loaded — start (or restart) playback for the current page.
  useEffect(() => {
    if (!playing) return;
    if (gated) {
      handleRef.current?.cancel();
      handleRef.current = null;
      clearAutoTurn();
      return;
    }
    if (!page) return;
    if (handleRef.current) return;
    startPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, gated, page]);

  useEffect(() => () => stop(), [stop]);

  return { playing, wordIdx, play, pause, toggle, seekToWord, speakOne, stop };
}

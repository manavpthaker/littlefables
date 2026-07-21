'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { startRecording, type Recording } from './recording';

// Checkpoint/retell mic plumbing, extracted from checkpoint.tsx (Redesign
// 2026-07-21) so the retell flow can reuse it. Owns the record → stop → hand
// off cycle, the max-listen timer, and mic-denied detection (which triggers
// the tap-choice fallback upstream).

export type MicState = 'idle' | 'listening' | 'processing' | 'heard';

const MAX_LISTEN_MS = 10_000; // PRD MicOrb timings

export function useCheckpointMic(args: {
  /** called with the recorded audio; the caller submits + judges */
  onAudio: (audio: Blob, attempt: number) => Promise<void>;
}): {
  micState: MicState;
  setMicState: (s: MicState) => void;
  /** true once getUserMedia failed — show the tap fallback */
  micDenied: boolean;
  nudge: string | null;
  setNudge: (n: string | null) => void;
  attempts: number;
  onMic: () => Promise<void>;
} {
  const [micState, setMicState] = useState<MicState>('idle');
  const [micDenied, setMicDenied] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);

  const attemptsRef = useRef(0);
  const recordingRef = useRef<Recording | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onAudioRef = useRef(args.onAudio);
  onAudioRef.current = args.onAudio;

  useEffect(
    () => () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      recordingRef.current?.stop().catch(() => undefined);
    },
    [],
  );

  const onMic = useCallback(async () => {
    if (micState === 'listening' || micState === 'processing') {
      const rec = recordingRef.current;
      if (rec) {
        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
        recordingRef.current = null;
        const blob = await rec.stop();
        await onAudioRef.current(blob, attemptsRef.current);
      }
      return;
    }
    setNudge(null);
    attemptsRef.current += 1;
    const rec = await startRecording();
    if (!rec) {
      setMicDenied(true);
      setNudge('The microphone is shy today — you can tap an answer instead.');
      return;
    }
    recordingRef.current = rec;
    setMicState('listening');
    stopTimerRef.current = setTimeout(async () => {
      if (recordingRef.current !== rec) return;
      recordingRef.current = null;
      const blob = await rec.stop();
      await onAudioRef.current(blob, attemptsRef.current);
    }, MAX_LISTEN_MS);
  }, [micState]);

  return { micState, setMicState, micDenied, nudge, setNudge, attempts: attemptsRef.current, onMic };
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Checkpoint as DsCheckpoint } from '@ds/components/reader/Checkpoint.jsx';
import type { CheckpointQuestion, GeneratedCheckpointRecord, JudgeSignal } from '@/lib/models/checkpoint';
import { startRecording, type Recording } from '@/lib/reader/recording';
import { speakUtterance } from '@/lib/voice/ui-voice';

type MicState = 'idle' | 'listening' | 'processing' | 'heard';
type MercyStage = 'none' | 'hint' | 'given';

export interface CheckpointResult {
  signal: JudgeSignal;
  outcome?: string;
  transcript?: string;
  newlyEarned?: string[];
}

interface Props {
  bookId: string;
  chapterIdx: number;
  chapterTitle: string;
  buddyName?: string;
  buddyColor?: string;
  onDone: (result: CheckpointResult | null) => void;
}

const MAX_LISTEN_MS = 10_000; // PRD MicOrb timings

/** Chapter-end checkpoint (PRD A10/A11). Generates a question, records the
 *  child's spoken answer, transcribes + judges via Anthropic, applies mercy. */
export function Checkpoint(props: Props) {
  const [question, setQuestion] = useState<CheckpointQuestion | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micState, setMicState] = useState<MicState>('idle');
  const [mercy, setMercy] = useState<MercyStage>('none');
  const [echo, setEcho] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [nudge, setNudge] = useState<string | null>(null);

  const attemptsRef = useRef(0);
  const recordingRef = useRef<Recording | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelled = useRef(false);

  // Fetch question on mount.
  useEffect(() => {
    cancelled.current = false;
    void (async () => {
      try {
        const res = await fetch('/api/child/checkpoint/generate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ bookId: props.bookId, chapterIdx: props.chapterIdx }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as GeneratedCheckpointRecord;
        if (cancelled.current) return;
        setQuestion(data.question);
        setRecordId(data.recordId);
        // Speak the question in the buddy voice when it arrives.
        void speakUtterance(data.question.question, { voice: 'buddy' });
      } catch (err) {
        if (cancelled.current) return;
        setError((err as Error).message);
      }
    })();
    return () => {
      cancelled.current = true;
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      recordingRef.current?.stop().catch(() => undefined);
    };
  }, [props.bookId, props.chapterIdx]);

  // Speak mercy lines when mercy escalates.
  const lastMercy = useRef<MercyStage>('none');
  useEffect(() => {
    if (!question) return;
    if (mercy === lastMercy.current) return;
    lastMercy.current = mercy;
    if (mercy === 'hint' && question.hint) {
      void speakUtterance(question.hint, { voice: 'buddy' });
    } else if (mercy === 'given' && question.given) {
      void speakUtterance(question.given, { voice: 'buddy' });
    }
  }, [mercy, question]);

  const submitAnswer = useCallback(
    async (audio: Blob) => {
      if (!recordId) return;
      setMicState('processing');
      const form = new FormData();
      form.append('recordId', recordId);
      form.append('audio', audio, 'answer.webm');
      form.append('attempt', String(attemptsRef.current));
      try {
        const res = await fetch('/api/child/checkpoint/answer', {
          method: 'POST',
          body: form,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          signal: JudgeSignal;
          outcome: string;
          transcript?: string;
          newlyEarned?: string[];
        };
        if (cancelled.current) return;
        setMicState('heard');
        setEcho(data.outcome);
        setTranscript(data.transcript ?? null);
        if (data.signal === 'correct' || data.signal === 'partial') {
          setTimeout(() => props.onDone(data), 1600);
          return;
        }
        if (mercy === 'none') setMercy('hint');
        else setMercy('given');
        setTimeout(() => setMicState('idle'), 1000);
      } catch {
        setMicState('idle');
        setNudge('That got a bit lost. Tap the mic to try again.');
      }
    },
    [recordId, mercy, props],
  );

  const onMic = useCallback(async () => {
    if (micState === 'listening' || micState === 'processing') {
      const rec = recordingRef.current;
      if (rec) {
        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
        recordingRef.current = null;
        const blob = await rec.stop();
        await submitAnswer(blob);
      }
      return;
    }
    setEcho(null);
    setTranscript(null);
    setNudge(null);
    attemptsRef.current += 1;
    const rec = await startRecording();
    if (!rec) {
      setNudge("I can't hear the microphone. Tap the mic to try again, or move on.");
      return;
    }
    recordingRef.current = rec;
    setMicState('listening');
    stopTimerRef.current = setTimeout(async () => {
      if (recordingRef.current !== rec) return;
      recordingRef.current = null;
      const blob = await rec.stop();
      await submitAnswer(blob);
    }, MAX_LISTEN_MS);
  }, [micState, submitAnswer]);

  const mercyProp = mercy === 'hint' ? 'hint' : mercy === 'given' ? 'given' : false;

  if (error && !question) {
    return (
      <section style={{ padding: 'var(--space-4)', display: 'grid', gap: 'var(--space-2)', textAlign: 'center' }}>
        <p style={{ color: 'var(--ink-soft)' }}>Story moves on — no question this time.</p>
        <button
          onClick={() => props.onDone(null)}
          style={{ background: 'var(--action)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius-pill)', padding: 'var(--space-2) var(--space-4)' }}
        >
          Next
        </button>
      </section>
    );
  }

  if (!question) {
    return (
      <section style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
        <p style={{ color: 'var(--ink-soft)' }}>{props.buddyName ?? 'Bramble'} is thinking…</p>
      </section>
    );
  }

  return (
    <section style={{ padding: 'var(--space-4)' }}>
      <DsCheckpoint
        buddyName={props.buddyName}
        buddyColor={props.buddyColor}
        type={question.type}
        question={question.question}
        micState={micState}
        mercy={mercyProp}
        hint={question.hint ?? undefined}
        given={question.given ?? undefined}
        onMic={onMic}
        onMoveOn={() => props.onDone(null)}
      />
      {echo && (
        <p style={{ fontFamily: 'var(--font-hand)', color: 'var(--ink-soft)', textAlign: 'center', marginTop: 'var(--space-2)' }}>
          {echo}
        </p>
      )}
      {transcript && (
        <p style={{ fontStyle: 'italic', color: 'var(--ink-faint)', textAlign: 'center', fontSize: 14 }}>
          &ldquo;{transcript}&rdquo;
        </p>
      )}
      {nudge && (
        <p style={{ color: 'var(--ink-soft)', textAlign: 'center', fontSize: 14 }}>{nudge}</p>
      )}
    </section>
  );
}

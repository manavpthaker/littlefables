'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Checkpoint as DsCheckpoint } from '@ds/components/reader/Checkpoint.jsx';
import type { ClientCheckpointQuestion, GeneratedCheckpointRecord, JudgeSignal } from '@/lib/models/checkpoint';
import { useCheckpointMic } from '@/lib/reader/use-checkpoint-mic';
import { speakUtterance } from '@/lib/voice/ui-voice';

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
  buddyEmoji?: string;
  onDone: (result: CheckpointResult | null) => void;
}

/** Chapter-end checkpoint (PRD A10/A11, brief §IV): rises as a bottom sheet
 *  over the page (story context stays visible), asks aloud, listens; two soft
 *  retries with a hint, then tap choices. Mic-denied goes straight to taps. */
export function Checkpoint(props: Props) {
  const [question, setQuestion] = useState<ClientCheckpointQuestion | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mercy, setMercy] = useState<MercyStage>('none');
  const [echo, setEcho] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const cancelled = useRef(false);

  const handleResult = useCallback(
    (data: CheckpointResult) => {
      if (cancelled.current) return;
      mic.setMicState('heard');
      setEcho(data.outcome ?? null);
      setTranscript(data.transcript ?? null);
      if (data.outcome) void speakUtterance(data.outcome, { voice: 'buddy', priority: 'checkpoint' });
      if (data.signal === 'correct' || data.signal === 'partial') {
        setTimeout(() => props.onDone(data), 1800);
        return;
      }
      setMercy((prev) => (prev === 'none' ? 'hint' : 'given'));
      setTimeout(() => mic.setMicState('idle'), 1000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props],
  );

  const submitAudio = useCallback(
    async (audio: Blob, attempt: number) => {
      if (!recordId) return;
      mic.setMicState('processing');
      const form = new FormData();
      form.append('recordId', recordId);
      form.append('audio', audio, 'answer.webm');
      form.append('attempt', String(attempt));
      try {
        const res = await fetch('/api/child/checkpoint/answer', { method: 'POST', body: form });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        handleResult((await res.json()) as CheckpointResult);
      } catch {
        mic.setMicState('idle');
        mic.setNudge('That got a bit lost. Tap the mic to try again.');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recordId, handleResult],
  );

  const mic = useCheckpointMic({ onAudio: submitAudio });

  const submitChoice = useCallback(
    async (choiceIdx: number) => {
      if (!recordId) return;
      mic.setMicState('processing');
      try {
        const res = await fetch('/api/child/checkpoint/answer', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ recordId, choiceIdx }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        handleResult((await res.json()) as CheckpointResult);
      } catch {
        mic.setMicState('idle');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recordId, handleResult],
  );

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
        const data = (await res.json()) as GeneratedCheckpointRecord | { skipped: true };
        if (cancelled.current) return;
        if ('skipped' in data) {
          props.onDone(null);
          return;
        }
        setQuestion(data.question);
        setRecordId(data.recordId);
        // Speak the question in the buddy voice when it arrives.
        void speakUtterance(data.question.question, { voice: 'buddy', priority: 'checkpoint' });
      } catch (err) {
        if (cancelled.current) return;
        setError((err as Error).message);
      }
    })();
    return () => {
      cancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.bookId, props.chapterIdx]);

  // Speak mercy lines when mercy escalates.
  const lastMercy = useRef<MercyStage>('none');
  useEffect(() => {
    if (!question) return;
    if (mercy === lastMercy.current) return;
    lastMercy.current = mercy;
    if (mercy === 'hint' && question.hint) {
      void speakUtterance(question.hint, { voice: 'buddy', priority: 'checkpoint' });
    } else if (mercy === 'given' && question.given) {
      void speakUtterance(question.given, { voice: 'buddy', priority: 'checkpoint' });
    }
  }, [mercy, question]);

  const mercyProp = mercy === 'hint' ? ('hint' as const) : mercy === 'given' ? ('given' as const) : false;

  // Tap fallback appears when the mic can't (denied) or after both mercy
  // stages have passed (brief §IV.2 — two soft retries first).
  const showChoices = Boolean(question?.fallbackChoices.length) && (mic.micDenied || mercy === 'given');

  const body = error && !question ? (
    <div style={{ display: 'grid', gap: 'var(--space-3)', textAlign: 'center', padding: 'var(--space-4)' }}>
      <p style={{ color: 'var(--ink-soft)', margin: 0 }}>Story moves on — no question this time.</p>
      <button
        onClick={() => props.onDone(null)}
        style={{ background: 'var(--action)', color: 'var(--action-ink)', border: 'none', borderRadius: 'var(--radius-pill)', padding: 'var(--space-3) var(--space-5)', minHeight: 'var(--tap-standard)', fontSize: 'var(--text-label)' }}
      >
        Next
      </button>
    </div>
  ) : !question ? (
    <p style={{ color: 'var(--ink-soft)', textAlign: 'center', padding: 'var(--space-4)', margin: 0 }}>
      {props.buddyName ?? 'Bramble'} is thinking…
    </p>
  ) : (
    <>
      <DsCheckpoint
        buddyName={props.buddyName}
        buddyColor={props.buddyColor}
        buddyEmoji={props.buddyEmoji}
        type={question.type}
        question={question.question}
        micState={mic.micState}
        mercy={mercyProp}
        hint={question.hint ?? undefined}
        given={question.given ?? undefined}
        options={showChoices ? question.fallbackChoices.map((c) => ({ label: c.label })) : undefined}
        onMic={mic.onMic}
        onPick={(i: number) => void submitChoice(i)}
        onMoveOn={() => props.onDone(null)}
      />
      {transcript && (
        <p style={{ fontStyle: 'italic', color: 'var(--ink-faint)', textAlign: 'center', fontSize: 14, margin: 'var(--space-2) 0 0' }}>
          &ldquo;{transcript}&rdquo;
        </p>
      )}
      {echo && !transcript && (
        <p style={{ fontFamily: 'var(--font-hand)', color: 'var(--ink-soft)', textAlign: 'center', margin: 'var(--space-2) 0 0' }}>{echo}</p>
      )}
      {mic.nudge && (
        <p style={{ color: 'var(--ink-soft)', textAlign: 'center', fontSize: 14, margin: 'var(--space-2) 0 0' }}>{mic.nudge}</p>
      )}
    </>
  );

  // Bottom sheet over the page (brief §V.3): the story stays visible behind a
  // soft scrim; the question rises from the reach zone.
  return (
    <section
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 45,
        display: 'grid',
        alignItems: 'end',
        justifyItems: 'center',
        background: 'var(--scrim-bottom)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          padding: '0 var(--space-3) var(--space-4)',
          display: 'grid',
          justifyItems: 'center',
          animation: 'lf-page-in var(--dur-settle) var(--ease-settle) 1',
        }}
      >
        {body}
      </div>
    </section>
  );
}

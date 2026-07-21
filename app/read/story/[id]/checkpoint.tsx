'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MicOrb } from '@ds/components/kid/MicOrb.jsx';
import { ChoiceBlocks } from '@ds/components/reader/ChoiceBlocks.jsx';
import type { ClientCheckpointQuestion, GeneratedCheckpointRecord, JudgeSignal } from '@/lib/models/checkpoint';
import { useCheckpointMic } from '@/lib/reader/use-checkpoint-mic';
import { speakUtterance } from '@/lib/voice/ui-voice';
import { SheetShell, SheetEyebrow } from './sheet-shell';

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
  chapterCount?: number;
  chapterTitle: string;
  buddyName?: string;
  buddyColor?: string;
  buddyEmoji?: string;
  onDone: (result: CheckpointResult | null) => void;
}

const TYPE_EYEBROW: Record<ClientCheckpointQuestion['type'], string> = {
  recall: 'What happened?',
  inference: 'Why do you think…',
  prediction: 'What comes next?',
  connection: 'What about you?',
};

/** Chapter-end checkpoint (PRD A10/A11, brief §IV): rises as a bottom sheet
 *  (mockup layout — progress segments, buddy circle, caps eyebrow, centered
 *  question, mic orb, tap fallback, quiet skip). Never quiz-styled. */
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

  // Tap fallback appears when the mic can't (denied) or after both mercy
  // stages have passed (brief §IV.2 — two soft retries first).
  const showChoices = Boolean(question?.fallbackChoices.length) && (mic.micDenied || mercy === 'given');

  return (
    <SheetShell
      segments={props.chapterCount ? { current: props.chapterIdx, total: props.chapterCount } : undefined}
      buddyColor={props.buddyColor}
      buddyEmoji={props.buddyEmoji}
      listening={mic.micState === 'listening'}
      onSkip={() => props.onDone(null)}
    >
      {error && !question ? (
        <p style={{ color: 'var(--ink-soft)', textAlign: 'center', margin: 0 }}>
          Story moves on — no question this time.
        </p>
      ) : !question ? (
        <p style={{ color: 'var(--ink-soft)', textAlign: 'center', margin: 0 }}>
          {props.buddyName ?? 'Your buddy'} is thinking…
        </p>
      ) : (
        <>
          <SheetEyebrow>{TYPE_EYEBROW[question.type]}</SheetEyebrow>
          <h2
            data-utterance={question.question}
            style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 25, lineHeight: 1.3, textAlign: 'center', color: 'var(--ink)' }}
          >
            {question.question}
          </h2>
          {mercy === 'hint' && question.hint && (
            <p style={{ margin: 0, textAlign: 'center', fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink-soft)' }}>
              {question.hint}
            </p>
          )}
          {mercy === 'given' && question.given && (
            <p style={{ margin: 0, textAlign: 'center', fontSize: 18, color: 'var(--ink-soft)', background: 'var(--butter-wash)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
              {question.given}
            </p>
          )}

          <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
            <MicOrb state={mic.micState} size={88} onTap={mic.onMic} utterance="Tell me what you think!" />
            {mic.micState === 'idle' && !mic.nudge && (
              <span style={{ fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink-soft)' }}>Tap to talk</span>
            )}
            {mic.nudge && (
              <span style={{ fontFamily: 'var(--font-hand)', fontSize: 16, color: 'var(--ink-soft)', textAlign: 'center' }}>{mic.nudge}</span>
            )}
          </div>

          {transcript && (
            <p style={{ margin: 0, textAlign: 'center', fontStyle: 'italic', color: 'var(--ink-faint)', fontSize: 15 }}>
              &ldquo;{transcript}&rdquo;
            </p>
          )}
          {echo && (
            <p style={{ margin: 0, textAlign: 'center', fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink-soft)' }}>{echo}</p>
          )}

          {showChoices && (
            <ChoiceBlocks
              compact
              options={question.fallbackChoices.map((c) => ({ label: c.label }))}
              onPick={(i: number) => void submitChoice(i)}
            />
          )}
        </>
      )}
    </SheetShell>
  );
}

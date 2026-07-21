'use client';

import { useEffect, useRef, useState } from 'react';
import { MicOrb } from '@ds/components/kid/MicOrb.jsx';
import { Button } from '@ds/components/core/Button.jsx';
import { StorySpine } from '@ds/components/reader/StorySpine.jsx';
import { useCheckpointMic } from '@/lib/reader/use-checkpoint-mic';
import { speakUtterance } from '@/lib/voice/ui-voice';
import { SheetShell, SheetEyebrow } from './sheet-shell';

// Tell-it-back (brief §IV — the gold-standard rung, mockup layout). Rises at
// book completion: eyebrow, serif prompt, mic orb, then the story-spine card
// filling beat by beat. Skipping is always one tap — retell gates nothing.

interface RetellState {
  recordId: string;
  prompt: string;
  beats: string[];
}

export function Retell(props: {
  bookId: string;
  bookTitle?: string;
  buddyName?: string;
  buddyColor?: string;
  buddyEmoji?: string;
  onDone: (completed: boolean) => void;
}) {
  const [session, setSession] = useState<RetellState | null>(null);
  const [hits, setHits] = useState<number[]>([]);
  const [echo, setEcho] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const cancelled = useRef(false);

  const mic = useCheckpointMic({
    onAudio: async (audio) => {
      if (!session) return;
      mic.setMicState('processing');
      const form = new FormData();
      form.append('recordId', session.recordId);
      form.append('audio', audio, 'retell.webm');
      try {
        const res = await fetch('/api/child/retell/answer', { method: 'POST', body: form });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { beatsHit: number[]; outcome: string; done: boolean };
        if (cancelled.current) return;
        setHits(data.beatsHit);
        setEcho(data.outcome);
        setDone(data.done);
        mic.setMicState('heard');
        void speakUtterance(data.outcome, { voice: 'buddy', priority: 'checkpoint' });
        if (!data.done) setTimeout(() => mic.setMicState('idle'), 1200);
      } catch {
        mic.setMicState('idle');
        mic.setNudge('That got a bit lost. Tap the mic and tell me again!');
      }
    },
  });

  useEffect(() => {
    cancelled.current = false;
    void (async () => {
      try {
        const res = await fetch('/api/child/retell/start', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ bookId: props.bookId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as RetellState | { skipped: true };
        if (cancelled.current) return;
        if ('skipped' in data) {
          props.onDone(false);
          return;
        }
        setSession(data);
        void speakUtterance(data.prompt, { voice: 'buddy', priority: 'checkpoint' });
      } catch {
        if (!cancelled.current) props.onDone(false);
      }
    })();
    return () => {
      cancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.bookId]);

  if (!session) return null;

  return (
    <SheetShell
      buddyColor={props.buddyColor}
      buddyEmoji={props.buddyEmoji}
      listening={mic.micState === 'listening'}
      onSkip={done ? undefined : () => props.onDone(false)}
    >
      <SheetEyebrow>Tell it back to me</SheetEyebrow>
      <h2
        data-utterance={session.prompt}
        style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 25, lineHeight: 1.3, textAlign: 'center', color: 'var(--ink)' }}
      >
        {session.prompt}
      </h2>

      <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
        <MicOrb state={mic.micState} size={88} onTap={mic.onMic} utterance="Tell me the whole story!" />
        {mic.micState === 'idle' && !mic.nudge && (
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink-soft)' }}>Tap to talk</span>
        )}
        {mic.nudge && (
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: 16, color: 'var(--ink-soft)', textAlign: 'center' }}>{mic.nudge}</span>
        )}
        {echo && (
          <p style={{ margin: 0, fontFamily: 'var(--font-hand)', color: 'var(--ink-soft)', textAlign: 'center' }}>{echo}</p>
        )}
      </div>

      {session.beats.length > 0 && (
        <div
          style={{
            background: 'var(--paper)',
            borderRadius: 20,
            padding: 'var(--space-4)',
            display: 'grid',
            gap: 'var(--space-3)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-hand)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-soft)',
            }}
          >
            {props.bookTitle ? `${props.bookTitle} — did you tell all of it?` : 'Did you tell all of it?'}
          </span>
          <StorySpine beats={session.beats.map((label, i) => ({ label, hit: hits.includes(i) }))} />
        </div>
      )}

      {done && (
        <Button
          variant="primary"
          size="primary"
          icon="star"
          utterance="You told the WHOLE story!"
          onClick={() => props.onDone(true)}
        >
          The whole story!
        </Button>
      )}
    </SheetShell>
  );
}

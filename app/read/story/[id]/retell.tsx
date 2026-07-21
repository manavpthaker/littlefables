'use client';

import { useEffect, useRef, useState } from 'react';
import { MicOrb } from '@ds/components/kid/MicOrb.jsx';
import { Buddy } from '@ds/components/kid/Buddy.jsx';
import { Button } from '@ds/components/core/Button.jsx';
import { StorySpine } from '@ds/components/reader/StorySpine.jsx';
import { useCheckpointMic } from '@/lib/reader/use-checkpoint-mic';
import { speakUtterance } from '@/lib/voice/ui-voice';

// Tell-it-back (brief §IV — the gold-standard rung). Rises as a bottom sheet
// at book completion: the buddy asks for the whole story, the child speaks
// (multiple turns welcome), the story spine fills beat by beat. Skipping is
// always one tap — retell gates nothing.

interface RetellState {
  recordId: string;
  prompt: string;
  beats: string[];
}

export function Retell(props: {
  bookId: string;
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
        const data = (await res.json()) as {
          beatsHit: number[];
          outcome: string;
          done: boolean;
        };
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
          background: 'var(--paper-bright)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          boxShadow: 'var(--elev-float)',
          padding: 'var(--space-5) var(--space-5) var(--space-6)',
          boxSizing: 'border-box',
          display: 'grid',
          gap: 'var(--space-4)',
          animation: 'lf-page-in var(--dur-settle) var(--ease-settle) 1',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
          <Buddy
            compact
            size={56}
            color={props.buddyColor}
            emoji={props.buddyEmoji}
            state={mic.micState === 'listening' ? 'listening' : 'speaking'}
          />
          <p
            data-utterance={session.prompt}
            style={{ fontFamily: 'var(--font-body)', fontSize: 21, lineHeight: 1.4, color: 'var(--ink)', margin: 0, paddingTop: 6 }}
          >
            {session.prompt}
          </p>
        </div>

        <div style={{ display: 'grid', justifyItems: 'center', gap: 'var(--space-2)' }}>
          <MicOrb state={mic.micState} onTap={mic.onMic} utterance="Tell me the whole story!" />
          {echo && (
            <p style={{ fontFamily: 'var(--font-hand)', color: 'var(--ink-soft)', textAlign: 'center', margin: 0 }}>{echo}</p>
          )}
          {mic.nudge && (
            <p style={{ color: 'var(--ink-soft)', textAlign: 'center', fontSize: 14, margin: 0 }}>{mic.nudge}</p>
          )}
        </div>

        <StorySpine beats={session.beats.map((label, i) => ({ label, hit: hits.includes(i) }))} />

        {done ? (
          <Button
            variant="primary"
            size="primary"
            icon="star"
            utterance="You told the WHOLE story!"
            onClick={() => props.onDone(true)}
          >
            The whole story!
          </Button>
        ) : (
          <Button variant="soft" icon="arrow-right" utterance="We can tell it another time." onClick={() => props.onDone(false)}>
            All done for now
          </Button>
        )}
      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import type { Buddy as BuddyMeta } from '@/lib/world/buddy-roster';
import { speakUtterance } from '@/lib/voice/ui-voice';

// Home header (mockup-fidelity): rounded buddy tile + "Hi, {name}!" serif +
// the world-memory greeting as the hand-font subtitle. Greeting is spoken on
// mount (PRD B1); bubble text = spoken text, verbatim (DS voice rule).

export function HomeBuddy(props: { buddy: BuddyMeta; utterance: string; childName?: string }) {
  const spokenFor = useRef<string | null>(null);
  useEffect(() => {
    if (!props.utterance) return;
    if (spokenFor.current === props.utterance) return;
    spokenFor.current = props.utterance;
    void speakUtterance(props.utterance, { voiceId: props.buddy.voiceId, voice: 'buddy' });
  }, [props.buddy.voiceId, props.utterance]);

  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
      <span
        aria-hidden="true"
        style={{
          width: 72,
          height: 72,
          flex: 'none',
          borderRadius: 20,
          background: `linear-gradient(150deg, color-mix(in oklch, ${props.buddy.pigment} 60%, white), ${props.buddy.pigment})`,
          display: 'grid',
          placeItems: 'center',
          fontSize: 40,
          boxShadow: 'var(--elev-card)',
        }}
      >
        {props.buddy.emoji}
      </span>
      <div style={{ display: 'grid', gap: 2, minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-display)', lineHeight: 1.1, color: 'var(--text-strong)' }}>
          Hi{props.childName ? `, ${props.childName}` : ''}!
        </h1>
        <p data-utterance={props.utterance} style={{ margin: 0, fontFamily: 'var(--font-hand)', fontSize: 'var(--text-hand)', color: 'var(--ink-soft)', overflowWrap: 'anywhere' }}>
          {props.utterance}
        </p>
      </div>
    </header>
  );
}

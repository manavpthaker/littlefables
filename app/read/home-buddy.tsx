'use client';

import { useEffect, useRef } from 'react';
import { Buddy } from '@ds/components/kid/Buddy.jsx';
import type { Buddy as BuddyMeta } from '@/lib/world/buddy-roster';
import { speakUtterance } from '@/lib/voice/ui-voice';

// Home Buddy — the world-memory greeting speaker (PRD B1). The greeting text
// is computed server-side and passed as both `utterance` (spoken on mount) and
// `speech` (the visible bubble the child reads along with).

export function HomeBuddy(props: { buddy: BuddyMeta; utterance: string; speech?: string }) {
  const spokenFor = useRef<string | null>(null);
  useEffect(() => {
    if (!props.utterance) return;
    if (spokenFor.current === props.utterance) return;
    spokenFor.current = props.utterance;
    void speakUtterance(props.utterance, { voiceId: props.buddy.voiceId, voice: 'buddy' });
  }, [props.buddy.voiceId, props.utterance]);

  return (
    <section
      style={{
        padding: 'var(--space-6) var(--page-pad) var(--space-4)',
        display: 'grid',
        placeItems: 'center',
        gap: 'var(--space-3)',
      }}
    >
      <Buddy
        name={props.buddy.name}
        color={props.buddy.pigment}
        emoji={props.buddy.emoji}
        state="idle"
        size={112}
        speech={props.speech ?? props.utterance}
        utterance={props.utterance}
      />
    </section>
  );
}

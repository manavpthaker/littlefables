'use client';

import { Buddy } from '@ds/components/kid/Buddy.jsx';
import type { Buddy as BuddyMeta } from '@/lib/world/buddy-roster';

// Home buddy — the world-memory greeting speaker (PRD B1). The greeting text
// is computed server-side and passed down as `utterance` so the utterance is
// spoken exactly once on mount (design-system voice-slot contract).

export function HomeBuddy(props: { buddy: BuddyMeta; utterance: string; speech?: string }) {
  return (
    <div style={{ padding: 'var(--space-4) var(--space-4) 0', display: 'grid', placeItems: 'center' }}>
      <Buddy
        name={props.buddy.name}
        color={props.buddy.pigment}
        state="idle"
        size={96}
        speech={props.speech ?? props.utterance}
        utterance={props.utterance}
      />
    </div>
  );
}

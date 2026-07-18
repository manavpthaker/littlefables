'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CelebrationQueue } from '@ds/components/world/Celebration.jsx';
import { badgeDisplay } from '@/lib/world/badge-catalog';
import { speakUtterance } from '@/lib/voice/ui-voice';

// Wrapper around CelebrationQueue that drives it from a rolling list of
// newly-earned badge slugs. Parents pipe response envelopes into `newlyEarned`;
// this component queues the CelebrationProps and lets the queue drain.

export function Celebrations({ newlyEarned }: { newlyEarned: string[] }) {
  const [drained, setDrained] = useState(0);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  // Deduplicate: never celebrate the same slug twice in a mount.
  const fresh = useMemo(
    () => newlyEarned.filter((slug) => !seen.has(slug)),
    [newlyEarned, seen],
  );

  const spokenFor = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!fresh.length) return;
    setSeen((s) => new Set([...s, ...fresh]));
    // Speak the first fresh celebration's utterance (queue speaks them one at
    // a time; here we announce whichever slug arrived first this batch).
    const first = fresh[0];
    if (first && !spokenFor.current.has(first)) {
      spokenFor.current.add(first);
      const b = badgeDisplay(first);
      if (b.utterance) void speakUtterance(b.utterance, { voice: 'buddy' });
    }
  }, [fresh]);

  const items = useMemo(
    () =>
      fresh.map((slug) => {
        const b = badgeDisplay(slug);
        return {
          kind: 'badge' as const,
          title: b.name,
          subtitle: b.utterance,
          icon: b.icon,
          color: b.color,
        };
      }),
    [fresh],
  );

  if (items.length === 0 || drained >= items.length) return null;

  return <CelebrationQueue items={items} onEmpty={() => setDrained(items.length)} />;
}

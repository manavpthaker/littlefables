'use client';

import { useEffect, useMemo, useState } from 'react';
import { CelebrationQueue } from '@ds/components/world/Celebration.jsx';
import { badgeDisplay } from '@/lib/world/badge-catalog';

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

  useEffect(() => {
    if (fresh.length) setSeen((s) => new Set([...s, ...fresh]));
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

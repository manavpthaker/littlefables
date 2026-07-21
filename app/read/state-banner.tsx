'use client';

import { useEffect, useState } from 'react';
import { StateBanner as DsStateBanner } from '@ds/components/system/SystemStates.jsx';
import { startAutoFlush, subscribe, summarize } from '@/lib/sync/outbox';

// Reader-side state banner. Reflects outbox state (kid density, quiet
// variant per rules-of-use.md). Also boots the auto-flush timer + online
// listener. Silent by default — only appears when there's something to say.

export function StateBannerBoot() {
  const [state, setState] = useState<'idle' | 'syncing' | 'synced' | 'syncfail'>('idle');

  useEffect(() => {
    startAutoFlush();
    let mounted = true;
    const update = async () => {
      const s = await summarize();
      if (!mounted) return;
      if (s.failed > 0) setState('syncfail');
      else if (s.pending > 0) setState('syncing');
      else setState((prev) => (prev === 'syncing' ? 'synced' : 'idle'));
    };
    void update();
    const unsub = subscribe(update);
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  // 'synced' is a moment, not a state: without another outbox event to move
  // things along, the confirmation would sit on screen forever. Let it land,
  // then get out of the way.
  useEffect(() => {
    if (state !== 'synced') return;
    const t = setTimeout(() => {
      setState((prev) => (prev === 'synced' ? 'idle' : prev));
    }, 2500);
    return () => clearTimeout(t);
  }, [state]);

  if (state === 'idle') return null;
  return <DsStateBanner state={state} density="kid" />;
}

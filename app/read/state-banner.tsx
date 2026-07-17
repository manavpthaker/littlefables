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

  if (state === 'idle') return null;
  return <DsStateBanner state={state} density="kid" />;
}

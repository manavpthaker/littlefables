'use client';

import { useCallback, useEffect, useState } from 'react';
import { isInBedtimeWindow, type BedtimeWindow } from '@/lib/models/settings';

// Bedtime mode (redesign brief §III.3): warms/dims the whole kid subtree via
// the [data-bedtime] token block, slows + lowers narration (transport
// voiceMod), and swaps the chapter-end checkpoint for a resolving line.
//
// Auto-on inside the parent-set window; the moon toggle overrides for the
// session (sessionStorage — bedtime is a per-sitting mood, not a preference).

const OVERRIDE_KEY = 'lf-bedtime-override';

function readOverride(): boolean | null {
  try {
    const raw = sessionStorage.getItem(OVERRIDE_KEY);
    return raw === null ? null : raw === '1';
  } catch {
    return null;
  }
}

export function useBedtime(window_: BedtimeWindow): { bedtime: boolean; toggleBedtime: () => void } {
  const [override, setOverride] = useState<boolean | null>(null);
  const [autoOn, setAutoOn] = useState(false);

  // Client-only init (sessionStorage + local clock are not SSR-safe).
  useEffect(() => {
    setOverride(readOverride());
    const check = () => setAutoOn(isInBedtimeWindow(window_, new Date().getHours()));
    check();
    const timer = setInterval(check, 5 * 60_000);
    return () => clearInterval(timer);
  }, [window_]);

  const bedtime = override ?? autoOn;

  // Reflect onto <html> so the token block reaches fixed/portal layers too.
  useEffect(() => {
    const root = document.documentElement;
    if (bedtime) root.setAttribute('data-bedtime', 'true');
    else root.removeAttribute('data-bedtime');
    return () => root.removeAttribute('data-bedtime');
  }, [bedtime]);

  const toggleBedtime = useCallback(() => {
    setOverride((prev) => {
      const next = !(prev ?? autoOn);
      try {
        sessionStorage.setItem(OVERRIDE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [autoOn]);

  return { bedtime, toggleBedtime };
}

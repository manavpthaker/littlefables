'use client';

import { useEffect, useState } from 'react';

// Landscape-spread breakpoint (PRD F2 — the reader must be comfortable on a
// phone held sideways, an iPad, or a laptop, not just phone-portrait).
// Wide-and-landscape gets the side-by-side book spread; everything else keeps
// the portrait full-bleed layout. SSR renders portrait (false) and corrects on
// mount — portrait is the safe default for the primary device.
const QUERY = '(orientation: landscape) and (min-width: 640px)';

export function useLandscapeSpread(): boolean {
  const [landscape, setLandscape] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    setLandscape(mq.matches);
    const on = (e: MediaQueryListEvent) => setLandscape(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return landscape;
}

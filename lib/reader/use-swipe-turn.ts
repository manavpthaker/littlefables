'use client';

import { useCallback, useRef } from 'react';

// Swipe-to-turn (UX pass 2026-07-21): a picture-book app must answer the most
// natural phone gesture there is. A horizontal swipe maps to the SAME
// prev/next the Transport buttons dispatch — it never auto-plays, so the
// reader transport contract (PRD A3) holds. Vertical pans and taps fall
// through untouched: we only claim clearly-horizontal, clearly-deliberate
// motion, judged at touch end (no preventDefault, no scroll hijacking).

const MIN_DX = 56; // px — a flick, not a wobble
const AXIS_RATIO = 1.6; // dx must beat dy by this much to count as horizontal

export function useSwipeTurn({
  enabled,
  onPrev,
  onNext,
}: {
  enabled: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    start.current = t ? { x: t.clientX, y: t.clientY } : null;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s || !enabled) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;
      if (Math.abs(dx) < MIN_DX || Math.abs(dx) < Math.abs(dy) * AXIS_RATIO) return;
      if (dx < 0) onNext();
      else onPrev();
    },
    [enabled, onNext, onPrev],
  );

  return { onTouchStart, onTouchEnd };
}

'use client';

import { useEffect } from 'react';

// Clock-driven lighting on kid surfaces (S3.2). Sets data-lighting on the
// nearest kid subtree element based on local time. The design-system's
// lighting.css defines the paper + shadow shifts per state; ink and pigments
// don't move. Boundaries: 5–11 morning · 11–17 day · 17–20 dusk · 20–5 night.

function lightingFor(now: Date): 'morning' | 'day' | 'dusk' | 'night' {
  const h = now.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

export function ClockLighting() {
  useEffect(() => {
    const apply = () => {
      const target = document.querySelector('[data-density="kid"]');
      if (!target) return;
      const stage = lightingFor(new Date());
      target.setAttribute('data-lighting', stage);
    };
    apply();
    // Re-check every 5 minutes so the transition through boundaries lands
    // without the child having to reload.
    const interval = window.setInterval(apply, 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);
  return null;
}

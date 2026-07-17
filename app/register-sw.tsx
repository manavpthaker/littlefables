'use client';

import { useEffect } from 'react';

// Registers the service worker post-mount. Skips in dev to avoid caching
// hot-reload chunks (which would poison the cache with stale content).
export function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV === 'development') return;

    void navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => {
        // Failure is not fatal — offline is progressive enhancement.
      });
  }, []);

  return null;
}

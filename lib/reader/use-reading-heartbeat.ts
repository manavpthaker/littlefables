'use client';

import { useEffect, useRef } from 'react';
import { enqueueAndSend } from '@/lib/sync/outbox';
import { speakUtterance } from '@/lib/voice/ui-voice';
import { todayIsoUtc } from '@/lib/world/dates';

// Minutes-read tracking (brief §III.5 Insights). One session id per reader
// mount; a visibility-aware 30s tick sends CUMULATIVE seconds through the
// outbox. The server upserts greatest(existing, incoming), so retries and
// out-of-order flushes are idempotent — never double-counted.
//
// Daily limit is SOFT (DS rules — no gates, no red): when today's total
// crosses the parent-set limit, the buddy gently suggests a rest, once.

const TICK_MS = 30_000;

const LIMIT_NUDGE = "We've read a lot today! One more page, then let's rest our eyes.";

export interface HeartbeatOptions {
  /** parent-set minutes/day; null = no limit */
  dailyLimitMin?: number | null;
  /** seconds already read today (server-side sum at reader mount) */
  todaySeconds?: number;
}

export function useReadingHeartbeat(active: boolean, opts: HeartbeatOptions = {}): void {
  const sessionId = useRef<string | null>(null);
  const accumulated = useRef(0);
  const lastResume = useRef<number | null>(null);
  const nudged = useRef(false);
  const { dailyLimitMin = null, todaySeconds = 0 } = opts;

  useEffect(() => {
    if (!active) return;
    if (!sessionId.current) sessionId.current = crypto.randomUUID();

    const resume = () => {
      if (lastResume.current === null) lastResume.current = Date.now();
    };
    const pause = () => {
      if (lastResume.current !== null) {
        accumulated.current += Date.now() - lastResume.current;
        lastResume.current = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') resume();
      else {
        pause();
        send();
      }
    };
    const send = () => {
      const live = lastResume.current !== null ? Date.now() - lastResume.current : 0;
      const seconds = Math.round((accumulated.current + live) / 1000);
      if (dailyLimitMin && !nudged.current && todaySeconds + seconds >= dailyLimitMin * 60) {
        nudged.current = true;
        void speakUtterance(LIMIT_NUDGE, { voice: 'buddy', priority: 'ambient' });
      }
      if (seconds < 5 || !sessionId.current) return;
      void enqueueAndSend(
        '/api/child/heartbeat',
        JSON.stringify({ sessionId: sessionId.current, day: todayIsoUtc(), seconds }),
      );
    };

    resume();
    document.addEventListener('visibilitychange', onVisibility);
    const timer = setInterval(send, TICK_MS);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(timer);
      pause();
      send();
    };
  }, [active, dailyLimitMin, todaySeconds]);
}

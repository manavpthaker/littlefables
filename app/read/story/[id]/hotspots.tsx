'use client';

import { speakUtterance } from '@/lib/voice/ui-voice';
import type { Hotspot } from '@/lib/models/book';

// Illustration hotspots (redesign brief §III.3): gentle glow dots over
// approved scene art. Tap → the narrator says what it is ("That's Ember, the
// little dragon."). Speech rides the 'tap' voice tier, so it yields to
// narration and checkpoint questions automatically. Reduced-motion gets a
// static dot; targets stay ≥44px even though the dot is smaller.

export function Hotspots({ hotspots }: { hotspots: Hotspot[] }) {
  return (
    <>
      {hotspots.map((h, i) => (
        <button
          key={`${h.label}-${i}`}
          type="button"
          aria-label={h.label}
          data-utterance={h.spoken}
          onClick={(e) => {
            e.stopPropagation();
            void speakUtterance(h.spoken, { voice: 'narrator', priority: 'tap' });
          }}
          style={{
            position: 'absolute',
            left: `${h.x * 100}%`,
            top: `${h.y * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: 44,
            height: 44,
            display: 'grid',
            placeItems: 'center',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            zIndex: 2,
            pointerEvents: 'auto',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'var(--wash-capsule)',
              backdropFilter: 'blur(14px)',
              boxShadow: '0 0 0 3px var(--marigold), var(--elev-rest)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              lineHeight: 1,
              animation: 'lf-breath var(--dur-breath) var(--ease-drift) infinite',
            }}
          >
            {h.emoji ?? ''}
          </span>
        </button>
      ))}
    </>
  );
}

import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';
import { motion, paper, pigment } from '../theme';

export interface BindProps {
  cover: string;
  delay?: number;
  size?: number;
}

/**
 * The book binding itself: the page grid collapses inward, the cover forms over
 * it, and a gilt rule draws around the edge. The last movement of beat 4 — the
 * moment the thing becomes an object.
 */
export const Bind: React.FC<BindProps> = ({ cover, delay = 0, size = 620 }) => {
  const frame = useCurrentFrame();

  const t = interpolate(frame, [delay, delay + motion.chime], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(t, [0, 1], [1.18, 1]);
  const opacity = interpolate(t, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' });

  // The rule draws after the cover has settled — two beats, not one.
  const ruleStart = delay + motion.settle;
  const rule = interpolate(frame, [ruleStart, ruleStart + motion.wind], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const inset = -18;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: paper.base,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <Img
          src={cover}
          style={{
            width: size,
            height: size,
            objectFit: 'cover',
            opacity,
            transform: `scale(${scale})`,
            boxShadow: '0 8px 16px rgba(42,29,18,0.10)',
          }}
        />

        {/* Gilt rule, drawn as two strokes meeting — top/right, then bottom/left. */}
        <svg
          width={size - inset * 2}
          height={size - inset * 2}
          style={{ position: 'absolute', left: inset, top: inset, pointerEvents: 'none' }}
        >
          <rect
            x={1}
            y={1}
            width={size - inset * 2 - 2}
            height={size - inset * 2 - 2}
            fill="none"
            stroke={pigment.gilt}
            strokeWidth={2}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - rule}
          />
        </svg>
      </div>
    </div>
  );
};

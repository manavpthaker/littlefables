import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';

/** Frame counts written by capture-mark.mjs. */
const LENGTH = { grow: 78, breathe: 225 } as const;

export interface MarkAnimProps {
  size?: number;
  /** 'grow' draws the mark on for the cold open; 'breathe' idles for the close. */
  mode?: keyof typeof LENGTH;
  delay?: number;
}

/**
 * The logomark, as a PNG sequence photographed from the design harness.
 *
 * The motion is CSS the designer wrote — a masked stroke-dashoffset draw-on
 * along the mark's own centreline guides. Reimplementing that in interpolate()
 * would mean two sources of truth for one animation, drifting apart on every
 * edit, so capture-mark.mjs drives the real stylesheet and screenshots it.
 *
 * Frames hold on the last one rather than looping: the entrance should settle,
 * and the idle is captured longer than the card it sits under.
 */
export const MarkAnim: React.FC<MarkAnimProps> = ({ size = 260, mode = 'grow', delay = 0 }) => {
  const frame = useCurrentFrame();
  const i = Math.max(0, Math.min(frame - delay, LENGTH[mode] - 1));

  return (
    <Img
      src={staticFile(`mark/${mode}/${String(i).padStart(4, '0')}.png`)}
      style={{ width: size, height: size }}
    />
  );
};

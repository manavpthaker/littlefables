import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { font, ink, paper, motion } from '../theme';

export interface CaptionProps {
  text: string;
  delay?: number;
  /** Frames visible before fading. Defaults to the rest of the sequence. */
  hold?: number;
  position?: 'bottom' | 'top';
}

/**
 * A low caption over live footage. Sits on a soft paper capsule so it stays
 * legible over illustration without a hard scrim, and never covers the art —
 * during the reading beat the software should be doing the talking.
 */
export const Caption: React.FC<CaptionProps> = ({
  text,
  delay = 0,
  hold,
  position = 'bottom',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = delay + (hold ?? durationInFrames - delay - motion.wind);

  const opacity = interpolate(
    frame,
    [delay, delay + motion.wind, out, out + motion.wind],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        [position]: 72,
        display: 'flex',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: font.body,
          fontSize: 34,
          color: ink.base,
          background: `${paper.warm}F2`,
          padding: '14px 30px',
          borderRadius: 999,
          backdropFilter: 'blur(14px)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

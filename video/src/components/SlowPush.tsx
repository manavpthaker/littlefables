import React from 'react';
import { Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export interface SlowPushProps {
  src: string;
  /** Total zoom across the whole beat. 0.04 = 4%, which is the intent: felt, not seen. */
  amount?: number;
  from?: 'in' | 'out';
}

/**
 * Imperceptible Ken Burns. Four percent over seven seconds — the viewer should
 * not notice the move, only that the frame is alive.
 *
 * Anything faster reads as a slideshow effect and cheapens the art.
 */
export const SlowPush: React.FC<SlowPushProps> = ({ src, amount = 0.04, from = 'in' }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const range = from === 'in' ? [1, 1 + amount] : [1 + amount, 1];
  const scale = interpolate(frame, [0, durationInFrames], range, {
    extrapolateRight: 'clamp',
  });

  return (
    <Img
      src={src}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${scale})`,
      }}
    />
  );
};

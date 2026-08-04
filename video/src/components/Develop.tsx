import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';
import { motion } from '../theme';

export interface DevelopProps {
  src: string;
  /** Frames before the image begins to resolve. */
  delay?: number;
  /** How long the resolve takes. Do not rush it — this beat is the argument. */
  duration?: number;
}

/**
 * The wet-paper-drying reveal: an image arrives blurred and drained, then
 * resolves edges-first as colour blooms inward.
 *
 * This is beat 4's anti-slop argument made visually. A generated image appears
 * all at once; a painted one develops. Speeding this up costs the whole point.
 */
export const Develop: React.FC<DevelopProps> = ({
  src,
  delay = 0,
  duration = motion.settle * 1.5,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Blur and desaturation clear early; the last of the warmth arrives late, so
  // the image looks like it is drying rather than fading up.
  const blur = interpolate(t, [0, 0.55], [26, 0], { extrapolateRight: 'clamp' });
  const saturate = interpolate(t, [0.1, 0.85], [0.15, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(t, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(t, [0, 1], [1.04, 1]);

  return (
    <Img
      src={src}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity,
        filter: `blur(${blur}px) saturate(${saturate})`,
        transform: `scale(${scale})`,
      }}
    />
  );
};

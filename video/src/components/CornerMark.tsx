import React from 'react';
import { interpolate, staticFile, useCurrentFrame } from 'remotion';
import { FPS, ink, paper } from '../theme';

/**
 * The mark, small and constant in the corner.
 *
 * With no brand card at the top of the film, this is what says whose work this
 * is — so it has to be legible without ever competing with the product. It
 * sits nearer a letterpress blind stamp than a broadcast bug.
 *
 * The artwork is the last frame of the draw-on sequence, so the corner and the
 * close are guaranteed to be the same mark. It is painted through a mask
 * rather than drawn as an image because the film runs over both paper and
 * full-bleed art: walnut ink on the cover put the mark at the same luma as its
 * background and it vanished. Tinting needs real colour control, and a
 * drop-shadow halo was not enough on its own.
 */
export const CornerMark: React.FC<{
  size?: number;
  /** Which surface it sits on. 'art' flips it to paper for dark full-bleed shots. */
  tone?: 'ink' | 'art';
  fadeInAt?: number;
}> = ({ size = 58, tone = 'ink', fadeInAt = 0.6 }) => {
  const frame = useCurrentFrame();
  const target = tone === 'art' ? 0.62 : 0.42;
  const opacity = interpolate(frame, [fadeInAt * FPS, (fadeInAt + 1.2) * FPS], [0, target], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const mask = `url(${staticFile('mark/grow/0077.png')}) center / contain no-repeat`;

  return (
    <div
      style={{
        position: 'absolute',
        left: 52,
        bottom: 44,
        width: size,
        height: size,
        opacity,
        pointerEvents: 'none',
        background: tone === 'art' ? paper.base : ink.base,
        WebkitMask: mask,
        mask,
      }}
    />
  );
};

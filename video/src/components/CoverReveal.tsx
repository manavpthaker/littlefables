import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { ease, paper, FPS } from '../theme';

const pendulum = Easing.bezier(...ease.pendulum);

export interface CoverRevealProps {
  src: string;
  /** Seconds the whole cover is held before the push begins. */
  hold?: number;
  /** Scale at the end of the push. 1 is "the whole cover fits". */
  to?: number;
}

/**
 * The book, whole, then closer.
 *
 * The cover art is square and the frame is 16:9, so the old treatment — a
 * plain object-fit:cover push — threw away about forty-four percent of the
 * image and opened the film on a crop of pond weeds. You could not tell it was
 * a book at all.
 *
 * This holds the entire cover first, margins and all, so the viewer reads
 * "book", and only then moves in. The push is what carries us into the beat
 * where the same book is being made.
 */
export const CoverReveal: React.FC<CoverRevealProps> = ({ src, hold = 2.6, to = 1.42 }) => {
  const frame = useCurrentFrame();
  const start = hold * FPS;

  // Ends a beat early so the cut into the intake lands while the move is still
  // going — a push that finishes first reads as a slideshow.
  const scale = interpolate(frame, [start, start + 4.6 * FPS], [1, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: pendulum,
  });

  return (
    <AbsoluteFill style={{ background: paper.base, overflow: 'hidden' }}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

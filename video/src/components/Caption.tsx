import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { font, ink, paper, pigment, motion } from '../theme';

export interface CaptionProps {
  text: string;
  delay?: number;
  /** Frames visible before fading. Defaults to the rest of the sequence. */
  hold?: number;
}

/**
 * Type in the page margin, not a chip on top of the picture.
 *
 * The previous version set the caption on a rounded paper capsule, which read
 * as a tooltip that had wandered in from another product — a bright blob
 * competing with the art rather than a title belonging to it.
 *
 * This lifts the bottom of the frame to paper instead, so the words sit in a
 * margin the way a running foot sits under a plate. The gradient does its work
 * over full-bleed illustration and disappears entirely on beats where the
 * background is already paper, which is how one treatment serves both — the
 * capsule had to be legible against everything, so it had to shout.
 *
 * Display face rather than body, because this is a title. The brass rule above
 * is the same mark the book covers use to close a title block.
 */
export const Caption: React.FC<CaptionProps> = ({ text, delay = 0, hold }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = delay + (hold ?? durationInFrames - delay - motion.wind);

  const opacity = interpolate(
    frame,
    [delay, delay + motion.wind, out, out + motion.wind],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // The wash outlasts the type a little, so the margin settles rather than
  // blinking out from under the last word.
  const wash = interpolate(
    frame,
    [delay, delay + motion.wind, out + motion.wind * 0.5, out + motion.wind * 1.5],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 300,
          opacity: wash,
          background:
            `linear-gradient(to top, ${paper.base} 0%, ${paper.base} 38%, ` +
            `${paper.base}E0 58%, ${paper.base}00 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 74,
          opacity,
          display: 'grid',
          justifyItems: 'center',
          gap: 16,
        }}
      >
        <span
          aria-hidden
          style={{ width: 88, height: 2, background: pigment.brass, opacity: 0.85 }}
        />
        <span
          style={{
            fontFamily: font.display,
            fontSize: 46,
            lineHeight: 1.2,
            color: ink.base,
            textAlign: 'center',
            maxWidth: 1280,
          }}
        >
          {text}
        </span>
      </div>
    </>
  );
};

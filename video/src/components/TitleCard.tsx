import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { font, ink, paper, pigment, motion } from '../theme';

export interface TitleCardProps {
  lines: string[];
  /** Rendered smaller and softer, after a pause. Beat 3's "That was all we asked for." */
  coda?: string;
  /** A fleuron between each line — beat 8's three quiet claims. */
  separators?: boolean;
  /** Frames between each line arriving. */
  stagger?: number;
  size?: number;
  align?: 'center' | 'left';
}

/**
 * Sequenced type on aged ivory. Lines rise a few pixels as they fade in —
 * never a slide, never a bounce. Used for the cold open, the child's details,
 * the quiet part, and the close.
 */
export const TitleCard: React.FC<TitleCardProps> = ({
  lines,
  coda,
  separators = false,
  stagger = motion.settle,
  size = 76,
  align = 'center',
}) => {
  const frame = useCurrentFrame();

  const reveal = (delay: number) => {
    const opacity = interpolate(frame, [delay, delay + motion.wind], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const lift = interpolate(frame, [delay, delay + motion.wind], [14, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return { opacity, transform: `translateY(${lift}px)` };
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: paper.base,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        padding: '0 180px',
        gap: 34,
      }}
    >
      {lines.map((line, i) => (
        <React.Fragment key={line}>
          {separators && i > 0 && (
            <div
              style={{
                ...reveal(i * stagger - motion.tick),
                color: pigment.brass,
                fontSize: 26,
                lineHeight: 1,
              }}
            >
              ❧
            </div>
          )}
          <div
            style={{
              ...reveal(i * stagger),
              fontFamily: font.display,
              fontSize: size,
              lineHeight: 1.15,
              color: ink.base,
              textAlign: align,
            }}
          >
            {line}
          </div>
        </React.Fragment>
      ))}

      {coda && (
        <div
          style={{
            ...reveal(lines.length * stagger + motion.settle),
            fontFamily: font.body,
            fontSize: size * 0.4,
            fontStyle: 'italic',
            color: ink.soft,
            marginTop: 22,
            textAlign: align,
          }}
        >
          {coda}
        </div>
      )}
    </div>
  );
};

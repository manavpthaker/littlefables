import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FPS, font, ink, paper, pigment } from '../theme';

export interface TypedProps {
  /** Each line types in turn. */
  lines: readonly string[];
  /** Characters per second. Human typing, not a teleprompter. */
  cps?: number;
  /** Seconds of pause between lines. */
  gap?: number;
}

/**
 * The question a parent actually types, appearing as they type it.
 *
 * Deliberately not a chat window. The words are the point — the sentence a
 * parent writes at eight in the evening about their own child — but framing
 * them in a ChatGPT or Claude bubble would say "this book was generated",
 * which is the one claim the whole product exists to deny. Set as type on
 * paper, the same as every other card in the film, it reads as a thought
 * rather than a query.
 *
 * The caret is what does the work: it is the only thing here that says a
 * person is present and typing this now.
 */
export const Typed: React.FC<TypedProps> = ({ lines, cps = 15, gap = 0.5 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // Walk the lines, working out how much of each has been typed by now.
  let clock = 0;
  const shown: string[] = [];
  let activeLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const dur = line.length / cps;
    if (t < clock) {
      shown.push('');
    } else if (t < clock + dur) {
      shown.push(line.slice(0, Math.floor((t - clock) * cps)));
      activeLine = i;
    } else {
      shown.push(line);
      if (activeLine === -1 && i === lines.length - 1) activeLine = i;
    }
    clock += dur + gap;
  }

  const done = t > clock - gap;
  // Blinks while waiting, steady while characters are landing — the way a
  // cursor actually behaves.
  const caretOn = done ? Math.floor(t / 0.53) % 2 === 0 : true;

  return (
    <AbsoluteFill
      style={{
        background: paper.base,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 200px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: 18,
          justifyItems: 'start',
          // Fixed, not shrink-to-fit. Sizing to content meant the block
          // re-centred every time a longer line arrived, so the first line
          // visibly jumped sideways as the second one was typed.
          width: 1080,
          fontFamily: font.body,
          fontSize: 52,
          lineHeight: 1.35,
          color: ink.base,
        }}
      >
        {shown.map((line, i) => (
          <span key={i} style={{ opacity: line ? 1 : 0 }}>
            {line}
            {i === activeLine && (
              <span
                style={{
                  display: 'inline-block',
                  width: 3,
                  height: '0.98em',
                  marginLeft: 4,
                  transform: 'translateY(0.14em)',
                  background: pigment.brass,
                  opacity: caretOn ? 1 : 0,
                }}
              />
            )}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

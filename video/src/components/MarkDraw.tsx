import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
// Imported straight from the design system so the film can never drift from
// the app's mark. Groups: #mark-halo>.mark-ray, #mark-tree, #mark-roots.
import { MARK_VIEWBOX, MARK_INNER } from '../../../design-system/components/core/markSvg.js';
import { ink, motion } from '../theme';

export interface MarkDrawProps {
  size?: number;
  color?: string;
  delay?: number;
  /** 'draw' for the cold open, 'breathe' for the close. */
  mode?: 'draw' | 'breathe';
}

/**
 * The mark, drawing itself in — mode 2 from design-system/tokens/motion.css.
 *
 * The cascade is deliberate and matches the DS: the tree first, then the rays
 * radiating outward, then the roots grounding it. Once drawn it settles into
 * mode 1, the slow halo breath.
 */
export const MarkDraw: React.FC<MarkDrawProps> = ({
  size = 300,
  color = ink.base,
  delay = 0,
  mode = 'draw',
}) => {
  const frame = useCurrentFrame();
  const t = frame - delay;

  const DRAW = motion.chime;
  const treeIn = interpolate(t, [0, DRAW], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const haloIn = interpolate(t, [motion.wind, motion.wind + DRAW], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rootIn = interpolate(t, [motion.settle, motion.settle + DRAW], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Halo breath begins once the draw has finished, and runs forever after.
  const settled = motion.settle + DRAW;
  const breathT = mode === 'breathe' ? t : Math.max(0, t - settled);
  const breath = 1 + 0.02 * Math.sin((breathT / motion.pulse) * Math.PI * 2);

  const drawn = mode === 'breathe';

  return (
    <div style={{ width: size, height: size * (252 / 240), color }}>
      <style>{`
        .lf-mark-anim #mark-tree * { stroke-dasharray: 1; stroke-dashoffset: var(--tree); }
        .lf-mark-anim #mark-halo * { stroke-dasharray: 1; stroke-dashoffset: var(--halo); }
        .lf-mark-anim #mark-roots * { stroke-dasharray: 1; stroke-dashoffset: var(--root); }
        .lf-mark-anim #mark-tree *, .lf-mark-anim #mark-halo *, .lf-mark-anim #mark-roots * {
          pathLength: 1;
        }
        .lf-mark-anim #mark-halo { transform-origin: center; transform: scale(var(--breath)); }
      `}</style>
      <svg
        viewBox={MARK_VIEWBOX}
        width="100%"
        height="100%"
        className={drawn ? undefined : 'lf-mark-anim'}
        style={
          {
            '--tree': drawn ? 0 : treeIn,
            '--halo': drawn ? 0 : haloIn,
            '--root': drawn ? 0 : rootIn,
            '--breath': breath,
          } as React.CSSProperties
        }
        dangerouslySetInnerHTML={{ __html: MARK_INNER }}
      />
    </div>
  );
};

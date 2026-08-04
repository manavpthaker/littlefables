import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';
import { motion, paper } from '../theme';

export interface PageFanProps {
  pages: string[];
  delay?: number;
  columns?: number;
}

/**
 * The eight pages arranging themselves into reading order.
 *
 * They arrive stacked and slightly rotated, as if just gathered off a desk,
 * then settle into a grid. Because the story runs across one continuous
 * evening, the grid reads as the light going down — which is the point of
 * showing them together at all.
 */
export const PageFan: React.FC<PageFanProps> = ({ pages, delay = 0, columns = 4 }) => {
  const frame = useCurrentFrame();
  const rows = Math.ceil(pages.length / columns);

  const cell = { w: 340, h: 255, gap: 26 };
  const gridW = columns * cell.w + (columns - 1) * cell.gap;
  const gridH = rows * cell.h + (rows - 1) * cell.gap;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: paper.base,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ position: 'relative', width: gridW, height: gridH }}>
        {pages.map((src, i) => {
          const start = delay + i * Math.round(motion.tick * 0.9);
          const t = interpolate(frame, [start, start + motion.settle], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const col = i % columns;
          const row = Math.floor(i / columns);
          const restX = col * (cell.w + cell.gap);
          const restY = row * (cell.h + cell.gap);

          // Start life in a loose pile at centre, land in the grid.
          const fromX = gridW / 2 - cell.w / 2;
          const fromY = gridH / 2 - cell.h / 2;
          const x = interpolate(t, [0, 1], [fromX, restX]);
          const y = interpolate(t, [0, 1], [fromY, restY]);

          // Deterministic tilt — alternating so the pile looks handled, not random.
          const tilt = (i % 2 === 0 ? -1 : 1) * (6 - (i % 3) * 1.5);
          const rotate = interpolate(t, [0, 1], [tilt, 0]);
          const scale = interpolate(t, [0, 1], [0.86, 1]);

          return (
            <Img
              key={src}
              src={src}
              style={{
                position: 'absolute',
                width: cell.w,
                height: cell.h,
                objectFit: 'cover',
                left: 0,
                top: 0,
                transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
                opacity: interpolate(t, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }),
                boxShadow: '0 4px 8px rgba(42,29,18,0.08)',
                zIndex: i,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

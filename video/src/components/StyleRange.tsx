import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { FPS, ease, font, ink, motion, paper, pigment } from '../theme';
import { COPY, STYLES } from '../beats';

const pendulum = Easing.bezier(...ease.pendulum);

/**
 * The range beat — six mediums at once.
 *
 * All together rather than one after another: the comparison is the entire
 * point, and it only lands if the eye can make it in a single glance. A
 * sequence would also make the viewer hold five images in memory to do the
 * same work.
 *
 * Six fits because the artwork changed. The first version used three ~615px
 * strips, where anything larger than a third of the frame went soft. These are
 * 1448x1086, so a 3x2 grid puts each near 560px — still a downscale, and twice
 * the range for the same eight seconds.
 */
export const StyleRange: React.FC = () => {
  const frame = useCurrentFrame();

  const heading = interpolate(frame, [motion.wind, motion.wind * 2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sub = interpolate(frame, [motion.settle, motion.settle + motion.wind], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: paper.base,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 34,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '26px 30px',
          alignItems: 'start',
        }}
      >
        {STYLES.map((s, i) => {
          // Staggered so they read as three separate books being laid down,
          // not one image sliced into thirds.
          // Reading order, a beat apart, so it lands as six books rather than
          // one image cut into six.
          const at = Math.round(i * 0.2 * FPS);
          const t = interpolate(frame, [at, at + motion.chime], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: pendulum,
          });
          return (
            <div
              key={s.file}
              style={{
                opacity: t,
                transform: `translateY(${(1 - t) * 26}px)`,
              }}
            >
              <Img
                src={staticFile(`styles/${s.file}`)}
                style={{
                  width: 452,
                  display: 'block',
                  borderRadius: 4,
                  boxShadow: '0 8px 26px rgba(46,33,22,0.22)',
                }}
              />
              <div
                style={{
                  marginTop: 12,
                  textAlign: 'center',
                  fontFamily: font.sc,
                  fontSize: 17,
                  letterSpacing: '0.13em',
                  color: pigment.brass,
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ opacity: heading, fontFamily: font.display, fontSize: 50, color: ink.base }}>
          {COPY.range}
        </div>
        <div
          style={{
            opacity: sub,
            marginTop: 14,
            fontFamily: font.body,
            fontSize: 31,
            color: ink.soft,
          }}
        >
          {COPY.rangeSub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { FPS, ease, font, ink, motion, paper, pigment } from '../theme';
import { COPY, STYLES } from '../beats';

const pendulum = Easing.bezier(...ease.pendulum);

/**
 * The range beat — three books, three mediums, side by side.
 *
 * Side by side rather than one after another for two reasons. The comparison
 * is the entire point, and it only lands if the eye can make it in one glance.
 * And the samples are about 615px wide, so a full-frame shot would be a 1.8x
 * upscale and go soft; three-up puts each at roughly 540px, very slightly
 * downscaled, which stays crisp.
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
        gap: 46,
      }}
    >
      <div style={{ display: 'flex', gap: 34, alignItems: 'center' }}>
        {STYLES.map((s, i) => {
          // Staggered so they read as three separate books being laid down,
          // not one image sliced into thirds.
          const at = Math.round(i * 0.34 * FPS);
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
                  width: 578,
                  display: 'block',
                  borderRadius: 4,
                  boxShadow: '0 8px 26px rgba(46,33,22,0.22)',
                }}
              />
              <div
                style={{
                  marginTop: 18,
                  textAlign: 'center',
                  fontFamily: font.sc,
                  fontSize: 19,
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
        <div style={{ opacity: heading, fontFamily: font.display, fontSize: 54, color: ink.base }}>
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

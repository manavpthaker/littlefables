import React from 'react';
import { OffthreadVideo, staticFile } from 'remotion';
import { READY } from '../beats';
import { font, ink, paper, pigment } from '../theme';

export interface DeviceFrameProps {
  /** Path relative to video/public — e.g. "recordings/04-page-turn.mov" */
  src: string;
  device?: 'ipad' | 'phone';
  /** Trim, in seconds, from the start of the source file. */
  startFrom?: number;
  scale?: number;
}

const SPEC = {
  // Landscape iPad, roughly 11-inch proportions.
  ipad: { w: 1180, h: 820, radius: 26, bezel: 20 },
  phone: { w: 420, h: 880, radius: 46, bezel: 12 },
} as const;

/**
 * A recording inside a device bezel. Deliberately plain — a thin dark frame and
 * a corner radius, no glossy highlights or drop-shadow theatre. The Heritage
 * register does not do product-render shine.
 */
export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  src,
  device = 'ipad',
  startFrom,
  scale = 1,
}) => {
  const d = SPEC[device];

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
      <div
        style={{
          width: d.w,
          height: d.h,
          padding: d.bezel,
          borderRadius: d.radius,
          background: ink.base,
          transform: `scale(${scale})`,
          boxShadow: '0 8px 16px rgba(42,29,18,0.10)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: d.radius - d.bezel / 2,
            overflow: 'hidden',
            background: paper.warm,
          }}
        >
          {READY.has(src) ? (
            <OffthreadVideo
              src={staticFile(src)}
              startFrom={startFrom}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                background: paper.warm,
              }}
            >
              <div style={{ fontFamily: font.sc, fontSize: 15, letterSpacing: '0.14em', color: pigment.brass }}>
                AWAITING RECORDING
              </div>
              <div style={{ fontFamily: font.body, fontSize: 22, color: ink.soft }}>{src}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

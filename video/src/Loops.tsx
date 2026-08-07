import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import { BOOK, RECORDINGS } from './beats';
import { paper, FPS } from './theme';
import { Develop } from './components/Develop';
import { Bind } from './components/Bind';
import { DeviceFrame } from './components/DeviceFrame';
import { useHeritageFonts } from './fonts';

/**
 * The four muted autoplay loops for the landing page's "How your book is made"
 * section. Each maps to a beat from the walkthrough — no burned-in captions,
 * because the page's step copy carries that job.
 *
 * The dissolve-through-cream at the loop join is baked into every clip: the
 * first and last 200ms fade to paper on both sides, so when the browser's loop
 * attribute wraps back to frame 0 the eye sees paper → paper (pagination),
 * not a jump cut (glitch).
 */

const sec = (s: number) => Math.round(s * FPS);
const FADE = sec(0.2);

const CreamMask: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, FADE], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [durationInFrames - FADE, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.max(fadeIn, fadeOut);
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill style={{ background: paper.base, opacity, pointerEvents: 'none' }} />
  );
};

// The DeviceFrame's iPad is 1180×820 — taller than our 720-high loop canvas
// by ~100px. Scale it down so the bezel actually shows, with a thin cream
// margin on all sides. 0.85 = 1003×697.
const LOOP_IPAD_SCALE = 0.85;

/** Step 1 — the intake. Real capture, real speed, 7s. */
export const LoopStep1: React.FC = () => {
  useHeritageFonts();
  return (
    <AbsoluteFill style={{ background: paper.base }}>
      <DeviceFrame src={RECORDINGS.intake} device="ipad" startFrom={4} scale={LOOP_IPAD_SCALE} />
      <CreamMask />
    </AbsoluteFill>
  );
};

/**
 * Step 2 — previews in 24 hours. Three panels from the revision sequence
 * (graphite → colour → final night scene) crossfading on --motion-settle.
 * The only clip with no film footage: three stills and two dissolves.
 *
 * The source composite is 1774×887 — three portrait panels side by side,
 * each ≈591×887 (≈2:3). We show one panel at a time by clipping to a
 * panel-wide inner box (height 100%, aspect ratio matched to a panel) and
 * shifting the full composite left by index panels. The inner box sits
 * centred on cream, so a portrait panel letterboxes with paper bars — the
 * revision sequence is a vertical composition and cropping the top or the
 * bottom would lose either the sky or the reflection.
 */
const REVISION = 'preview-revision-sequence.png';
const REVISION_W = 1774;
const REVISION_H = 887;
const REVISION_PANELS = 3;
const RevisionPanel: React.FC<{ index: 0 | 1 | 2; opacity: number }> = ({ index, opacity }) => (
  <AbsoluteFill
    style={{
      opacity,
      background: paper.base,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        height: '100%',
        aspectRatio: `${REVISION_W / REVISION_PANELS} / ${REVISION_H}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Img
        src={staticFile(REVISION)}
        style={{
          position: 'absolute',
          top: 0,
          left: `-${index * 100}%`,
          height: '100%',
          width: 'auto',
          display: 'block',
          maxWidth: 'none',
        }}
      />
    </div>
  </AbsoluteFill>
);

export const LoopStep2: React.FC = () => {
  useHeritageFonts();
  const frame = useCurrentFrame();
  // Each panel sits full-strength for ~2s and crossfades over ~0.7s. That is
  // long enough to feel painted rather than swiped — the whole beat is 7.8s.
  const M = sec(2.6);
  const XF = sec(0.7);
  const p0 = interpolate(frame, [0, M - XF, M], [1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const p1 = interpolate(frame, [M - XF, M, 2 * M - XF, 2 * M], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const p2 = interpolate(frame, [2 * M - XF, 2 * M], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ background: paper.base }}>
      <RevisionPanel index={0} opacity={p0} />
      <RevisionPanel index={1} opacity={p1} />
      <RevisionPanel index={2} opacity={p2} />
      <CreamMask />
    </AbsoluteFill>
  );
};

/**
 * Step 3 — we write, paint, narrate. Beat 4b's wet-paper-drying colour
 * resolve on page 4, then a short bind on the cover. Do not speed it up:
 * this movement is the anti-slop argument made visual.
 */
export const LoopStep3: React.FC = () => {
  useHeritageFonts();
  return (
    <AbsoluteFill style={{ background: paper.base }}>
      <Sequence durationInFrames={sec(5)}>
        <Develop src={staticFile(BOOK.pages[3]!)} duration={sec(3.6)} />
      </Sequence>
      <Sequence from={sec(5)} durationInFrames={sec(3)}>
        <Bind cover={staticFile(BOOK.cover)} />
      </Sequence>
      <CreamMask />
    </AbsoluteFill>
  );
};

/**
 * Step 4 — it arrives on their iPad. Beat 5: the delivery email as a still,
 * then the book opening in the real reader. A2HS has no capture, so the
 * shot pair carries the beat on its own.
 */
export const LoopStep4: React.FC = () => {
  useHeritageFonts();
  return (
    <AbsoluteFill style={{ background: paper.base }}>
      <Sequence durationInFrames={sec(3)}>
        <DeviceFrame src={BOOK.email} device="ipad" still scale={LOOP_IPAD_SCALE} />
      </Sequence>
      <Sequence from={sec(3)} durationInFrames={sec(5)}>
        <DeviceFrame src={RECORDINGS.open} device="ipad" startFrom={1} scale={LOOP_IPAD_SCALE} />
      </Sequence>
      <CreamMask />
    </AbsoluteFill>
  );
};

export const LOOP_FPS = FPS;
export const LOOP_FRAMES = sec(8);
export const LOOP_WIDTH = 1280;
export const LOOP_HEIGHT = 720;

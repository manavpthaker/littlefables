import React from 'react';
import { Composition } from 'remotion';
import { Walkthrough } from './Walkthrough';
import { Etsy, ETSY_FRAMES, ETSY_FPS } from './Etsy';
import {
  LoopStep1,
  LoopStep2,
  LoopStep3,
  LoopStep4,
  LOOP_FPS,
  LOOP_FRAMES,
  LOOP_WIDTH,
  LOOP_HEIGHT,
} from './Loops';
import { TOTAL_FRAMES, FPS_EXPORT } from './registry';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Walkthrough"
      component={Walkthrough}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS_EXPORT}
      width={1920}
      height={1080}
    />
    {/* Square cut of the full walkthrough, same source, reframed. */}
    <Composition
      id="WalkthroughSquare"
      component={Walkthrough}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS_EXPORT}
      width={1080}
      height={1080}
    />
    {/* 15-second cut for the Etsy listing video slot. Muted, square. */}
    <Composition
      id="Etsy"
      component={Etsy}
      durationInFrames={ETSY_FRAMES}
      fps={ETSY_FPS}
      width={1080}
      height={1080}
    />
    {/* Landing "How your book is made" step loops — muted, no captions,
        cream fade at both ends so the browser's loop join reads as
        pagination rather than a jump cut. */}
    {(
      [
        ['LoopStep1', LoopStep1],
        ['LoopStep2', LoopStep2],
        ['LoopStep3', LoopStep3],
        ['LoopStep4', LoopStep4],
      ] as const
    ).map(([id, C]) => (
      <Composition
        key={id}
        id={id}
        component={C}
        durationInFrames={LOOP_FRAMES}
        fps={LOOP_FPS}
        width={LOOP_WIDTH}
        height={LOOP_HEIGHT}
      />
    ))}
  </>
);

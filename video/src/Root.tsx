import React from 'react';
import { Composition } from 'remotion';
import { Walkthrough } from './Walkthrough';
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
    {/* Square cut for Etsy's video slot — same source, reframed. */}
    <Composition
      id="WalkthroughSquare"
      component={Walkthrough}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS_EXPORT}
      width={1080}
      height={1080}
    />
  </>
);

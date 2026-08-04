import React from 'react';
import { AbsoluteFill, Sequence, staticFile, interpolate, useCurrentFrame } from 'remotion';

import { BEATS, COPY, BOOK, RECORDINGS, frames } from './beats';
import { font, ink, paper, pigment, motion, FPS } from './theme';

import { MarkDraw } from './components/MarkDraw';
import { TitleCard } from './components/TitleCard';
import { SlowPush } from './components/SlowPush';
import { Develop } from './components/Develop';
import { PageFan } from './components/PageFan';
import { Bind } from './components/Bind';
import { DeviceFrame } from './components/DeviceFrame';
import { Caption } from './components/Caption';
import { loadFonts } from './fonts';

loadFonts();

const sec = (s: number) => Math.round(s * FPS);

/** Beat 1 — the mark draws itself in, wordmark beneath. */
const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const wordmark = interpolate(frame, [motion.settle, motion.settle + motion.wind], [0, 1], {
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
        gap: 24,
      }}
    >
      <MarkDraw size={260} />
      <div style={{ opacity: wordmark, textAlign: 'center' }}>
        <div style={{ fontFamily: font.display, fontSize: 66, color: ink.base }}>{COPY.brand}</div>
        <div
          style={{
            fontFamily: font.sc,
            fontSize: 21,
            letterSpacing: '0.14em',
            color: pigment.brass,
            marginTop: 12,
          }}
        >
          {COPY.tagline}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Beat 4 — the book assembling itself. Four movements, no recording. */
const ComesTogether: React.FC = () => {
  const M = sec(5); // each movement
  const frame = useCurrentFrame();

  const caption = interpolate(frame, [M * 3 + motion.settle, M * 3 + motion.settle + motion.wind], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: paper.base }}>
      {/* a. Ink — the words become the girl. */}
      <Sequence durationInFrames={M}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 200px' }}>
          <TitleCard
            lines={['dark curly hair', 'a forest-green cardigan', 'scuffed brown boots']}
            size={46}
            stagger={motion.wind}
          />
        </AbsoluteFill>
      </Sequence>

      {/* b. Colour — pages develop like wet paper drying. */}
      <Sequence from={M} durationInFrames={M}>
        <AbsoluteFill>
          <Develop src={staticFile(BOOK.pages[3])} />
        </AbsoluteFill>
      </Sequence>

      {/* c. Order — eight pages find their reading order. */}
      <Sequence from={M * 2} durationInFrames={M}>
        <PageFan pages={BOOK.pages.map(staticFile)} />
      </Sequence>

      {/* d. Bound — the cover forms, a gilt rule draws around it. */}
      <Sequence from={M * 3}>
        <Bind cover={staticFile(BOOK.cover)} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 90 }}>
          <div style={{ opacity: caption, fontFamily: font.body, fontSize: 34, color: ink.soft }}>
            {COPY.assembled}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

/** Beat 5 — email, link, home screen. Three cuts. */
const Arrives: React.FC = () => {
  const third = sec(10 / 3);
  return (
    <AbsoluteFill style={{ background: paper.base }}>
      <Sequence durationInFrames={third}>
        <DeviceFrame src={RECORDINGS.email} device="phone" />
      </Sequence>
      <Sequence from={third} durationInFrames={third}>
        <DeviceFrame src={RECORDINGS.open} device="phone" />
      </Sequence>
      <Sequence from={third * 2}>
        <DeviceFrame src={RECORDINGS.addToHome} device="ipad" />
        <Caption text={COPY.arrivesSub} delay={motion.settle} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Beat 6 — real reading. Minimal overlay; the software talks. */
const Payoff: React.FC = () => {
  const quarter = sec(4);
  const shots = [
    { src: RECORDINGS.pageTurn, caption: COPY.payoff[0] },
    { src: RECORDINGS.wordTap, caption: COPY.payoff[1] },
    { src: RECORDINGS.transport, caption: COPY.payoff[2] },
    { src: RECORDINGS.pageTurn, caption: null },
  ];

  return (
    <AbsoluteFill style={{ background: paper.base }}>
      {shots.map((shot, i) => (
        <Sequence key={i} from={quarter * i} durationInFrames={quarter}>
          <DeviceFrame src={shot.src} device="ipad" />
          {shot.caption && <Caption text={shot.caption} delay={motion.wind} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Beat 9 — mark returns, details settle. */
const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const details = interpolate(frame, [motion.wind, motion.wind + motion.settle], [0, 1], {
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
        gap: 28,
      }}
    >
      <MarkDraw size={180} mode="breathe" />
      <div style={{ opacity: details, textAlign: 'center' }}>
        <div style={{ fontFamily: font.body, fontSize: 34, color: ink.soft }}>{COPY.close}</div>
        <div style={{ fontFamily: font.display, fontSize: 52, color: ink.base, marginTop: 20 }}>
          {COPY.url}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Walkthrough: React.FC = () => (
  <AbsoluteFill style={{ background: paper.base }}>
    <Sequence {...frames(BEATS.coldOpen)}>
      <ColdOpen />
    </Sequence>

    <Sequence {...frames(BEATS.promise)}>
      <AbsoluteFill>
        <SlowPush src={staticFile(BOOK.cover)} />
        <Caption text={COPY.promise} delay={motion.wind} position="bottom" />
      </AbsoluteFill>
    </Sequence>

    <Sequence {...frames(BEATS.aboutChild)}>
      <TitleCard lines={COPY.child} coda={COPY.childCoda} size={64} />
    </Sequence>

    <Sequence {...frames(BEATS.comesTogether)}>
      <ComesTogether />
    </Sequence>

    <Sequence {...frames(BEATS.arrives)}>
      <Arrives />
    </Sequence>

    <Sequence {...frames(BEATS.payoff)}>
      <Payoff />
    </Sequence>

    <Sequence {...frames(BEATS.night)}>
      <AbsoluteFill>
        <DeviceFrame src={RECORDINGS.night} device="ipad" />
        <Caption text={COPY.night} delay={motion.settle} />
      </AbsoluteFill>
    </Sequence>

    <Sequence {...frames(BEATS.quiet)}>
      <TitleCard lines={COPY.quiet} separators size={50} stagger={sec(2.2)} />
    </Sequence>

    <Sequence {...frames(BEATS.close)}>
      <Close />
    </Sequence>
  </AbsoluteFill>
);

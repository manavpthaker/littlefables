import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { existsSync } from './hasAudio';

import { AUDIO, BEATS, COPY, BOOK, RECORDINGS, frames } from './beats';
import { font, ink, paper, motion, FPS } from './theme';

import { CornerMark } from './components/CornerMark';
import { StyleRange } from './components/StyleRange';
import { MarkAnim } from './components/MarkAnim';
import { TitleCard } from './components/TitleCard';
import { SlowPush } from './components/SlowPush';
import { Develop } from './components/Develop';
import { PageFan } from './components/PageFan';
import { Bind } from './components/Bind';
import { DeviceFrame } from './components/DeviceFrame';
import { Caption } from './components/Caption';
import { useHeritageFonts } from './fonts';

const sec = (s: number) => Math.round(s * FPS);

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
          <Develop src={staticFile(BOOK.pages[3]!)} />
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

/**
 * Beat 5 — the email, then the book opening.
 *
 * Everything sits in an iPad frame. An earlier cut put the email and the
 * open shot in a phone bezel, which cropped footage captured at iPad
 * landscape — one device throughout is both truer and cleaner.
 */
const Arrives: React.FC = () => {
  const half = sec(7);
  return (
    <AbsoluteFill style={{ background: paper.base }}>
      <Sequence durationInFrames={half}>
        <DeviceFrame src={BOOK.email} device="ipad" still />
        <Caption text={COPY.arrives} delay={motion.settle} />
      </Sequence>
      <Sequence from={half}>
        <DeviceFrame src={RECORDINGS.open} device="ipad" startFrom={1} />
        <Caption text={COPY.arrivesSub} delay={motion.settle} />
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * Beat 6 — real reading, in the order a person actually does it: press play,
 * turn a page, tap a word.
 *
 * Three shots across twenty-four seconds rather than four across sixteen. The
 * earlier cut moved faster than the narration underneath it, so the eye and
 * the ear were describing different things.
 */
const Payoff: React.FC = () => {
  // startFrom skips each capture's own navigation — goto, click, load — so the
  // film cuts straight to the reader rather than watching it boot.
  const shots = [
    { src: RECORDINGS.transport, caption: COPY.payoff[0], len: sec(9), from: 2.8 },
    { src: RECORDINGS.pageTurn, caption: COPY.payoff[1], len: sec(8), from: 3.6 },
    { src: RECORDINGS.wordTap, caption: COPY.payoff[2], len: sec(7), from: 3.6 },
  ];

  let at = 0;
  return (
    <AbsoluteFill style={{ background: paper.base }}>
      {/* The product reading itself aloud — the one voice in the film. */}
      <Sequence from={Math.round(AUDIO.narrationDelay * FPS)}>
        <Audio src={staticFile(AUDIO.narration)} volume={AUDIO.narrationVolume} />
      </Sequence>

      {shots.map((shot, i) => {
        const from = at;
        at += shot.len;
        return (
          <Sequence key={i} from={from} durationInFrames={shot.len}>
            <DeviceFrame src={shot.src} device="ipad" startFrom={shot.from} />
            <Caption text={shot.caption} delay={motion.settle} hold={shot.len - motion.settle * 2} />
          </Sequence>
        );
      })}
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
      <MarkAnim size={230} mode="grow" />
      <div style={{ opacity: details, textAlign: 'center' }}>
        <div style={{ fontFamily: font.body, fontSize: 34, color: ink.soft }}>{COPY.close}</div>
        <div style={{ fontFamily: font.display, fontSize: 52, color: ink.base, marginTop: 20 }}>
          {COPY.url}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Music bed, fading in and ducking under the narration beat. */
const MusicBed: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const duckIn = AUDIO.duckFrom * fps;
  const duckOut = AUDIO.duckTo * fps;
  const fadeIn = AUDIO.fadeInSeconds * fps;
  const fadeOut = AUDIO.fadeOutSeconds * fps;

  return (
    <Audio
      src={staticFile(AUDIO.bed)}
      volume={(f) =>
        interpolate(
          f,
          [0, fadeIn, duckIn, duckIn + fps, duckOut, duckOut + fps, durationInFrames - fadeOut, durationInFrames],
          [
            0,
            AUDIO.volume,
            AUDIO.volume,
            AUDIO.duckedVolume,
            AUDIO.duckedVolume,
            AUDIO.volume,
            AUDIO.volume,
            0,
          ],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        )
      }
    />
  );
};

export const Walkthrough: React.FC = () => {
  useHeritageFonts();

  return (
  <AbsoluteFill style={{ background: paper.base }}>
    {existsSync && <MusicBed />}
    <Sequence {...frames(BEATS.promise)}>
      <AbsoluteFill>
        <SlowPush src={staticFile(BOOK.cover)} />
        <Caption text={COPY.promise} delay={motion.wind} position="bottom" />
      </AbsoluteFill>
    </Sequence>

    <Sequence {...frames(BEATS.intake)}>
      <DeviceFrame src={RECORDINGS.intake} device="ipad" />
      <Caption text={COPY.intake} delay={motion.settle} hold={sec(5)} />
      <Caption text={COPY.intakeSub} delay={sec(11)} hold={sec(5)} />
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
        <DeviceFrame src={RECORDINGS.night} device="ipad" startFrom={4.2} />
        <Caption text={COPY.night} delay={motion.settle} />
      </AbsoluteFill>
    </Sequence>

    <Sequence {...frames(BEATS.range)}>
      <StyleRange />
    </Sequence>

    <Sequence {...frames(BEATS.quiet)}>
      <TitleCard lines={COPY.quiet} separators size={50} stagger={sec(2.2)} />
    </Sequence>

    {/* Two passes rather than one, because the promise beat is full-bleed art
        and everything after it is paper. Splitting it keeps the tone an
        explicit statement about each beat instead of a frame-number guess
        buried inside the component. */}
    <Sequence {...frames(BEATS.promise)}>
      <CornerMark tone="art" />
    </Sequence>
    <Sequence from={sec(BEATS.intake.start)} durationInFrames={sec(BEATS.quiet.end - BEATS.intake.start)}>
      <CornerMark tone="ink" fadeInAt={0} />
    </Sequence>

    <Sequence {...frames(BEATS.close)}>
      <Close />
    </Sequence>
  </AbsoluteFill>
);
};

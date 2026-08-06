import React from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { existsSync } from './hasAudio';

import { AUDIO, BEATS, BROLL, COPY, BOOK, RECORDINGS, frames } from './beats';
import { font, ink, paper, pigment, motion, FPS } from './theme';

import { CornerMark } from './components/CornerMark';
import { Typed } from './components/Typed';
import { StyleRange } from './components/StyleRange';
import { MarkAnim } from './components/MarkAnim';
import { TitleCard } from './components/TitleCard';
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
  // One continuous take rather than three cuts. Each of the old shots
  // re-opened the book, so page one appeared, the film cut, and page one
  // appeared again before flipping away — and the narration ran on across the
  // join, reading a page the picture had already left.
  return (
    <AbsoluteFill style={{ background: paper.base }}>
      {/* The product reading itself aloud — the one voice in the film. */}
      <Sequence from={Math.round(AUDIO.narrationDelay * FPS)}>
        <Audio src={staticFile(AUDIO.narration)} volume={AUDIO.narrationVolume} />
      </Sequence>

      {/* startFrom lands on page one already settled, just after play. */}
      <DeviceFrame src={RECORDINGS.payoff} device="ipad" startFrom={7.5} />

      {COPY.payoff.map((text, i) => (
        <Caption
          key={i}
          text={text}
          delay={Math.round((COPY.payoffAt[i] ?? 0) * FPS)}
          hold={sec(i === 0 ? 8.5 : i === 1 ? 4 : 6)}
        />
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
      <MarkAnim size={230} mode="grow" />
      <div style={{ opacity: details, textAlign: 'center' }}>
        <div style={{ fontFamily: font.body, fontSize: 34, color: ink.soft }}>{COPY.close}</div>
        <div style={{ fontFamily: font.display, fontSize: 52, color: ink.base, marginTop: 20 }}>
          {COPY.url}
        </div>
        <div
          style={{
            fontFamily: font.sc,
            fontSize: 24,
            letterSpacing: '0.1em',
            color: pigment.brass,
            marginTop: 16,
          }}
        >
          {COPY.etsy}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Music bed, fading in and ducking under the narration beat. */
const MusicBed: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const fadeIn = AUDIO.fadeInSeconds * fps;
  const fadeOut = AUDIO.fadeOutSeconds * fps;

  // One ramp pair per duck window, in order, so the bed drops for each voice
  // and recovers between them.
  const points: number[] = [0, fadeIn];
  const levels: number[] = [0, AUDIO.volume];
  for (const d of AUDIO.ducks) {
    points.push(d.from * fps, d.from * fps + fps, d.to * fps, d.to * fps + fps);
    const under = (d as { level?: number }).level ?? AUDIO.duckedVolume;
    levels.push(AUDIO.volume, under, under, AUDIO.volume);
  }
  points.push(durationInFrames - fadeOut, durationInFrames);
  levels.push(AUDIO.volume, 0);

  return (
    <Audio
      src={staticFile(AUDIO.bed)}
      volume={(f) => interpolate(f, points, levels, { extrapolateRight: 'clamp' })}
    />
  );
};

export const Walkthrough: React.FC = () => {
  useHeritageFonts();

  return (
  <AbsoluteFill style={{ background: paper.base }}>
    {existsSync && <MusicBed />}
    <Sequence {...frames(BEATS.ask)}>
      <Typed lines={COPY.ask} />
    </Sequence>

    {/* The mark answers the question, and hands over to the form. No
        illustration yet — the art is held back so the assembly beat is the
        first sight of it, which is what makes that beat a reveal. */}
    <Sequence {...frames(BEATS.mark)}>
      <AbsoluteFill
        style={{ background: paper.base, alignItems: 'center', justifyContent: 'center' }}
      >
        <MarkAnim size={230} mode="grow" />
      </AbsoluteFill>
    </Sequence>

    <Sequence {...frames(BEATS.intake)}>
      {/* Skips the white page load, and lands the window so the finished form —
          photo attached, submit button live — gets a few seconds rather than
          arriving as the beat cuts. */}
      <DeviceFrame src={RECORDINGS.intake} device="ipad" startFrom={4} />
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
        <Caption text={COPY.night} delay={motion.settle} hold={sec(5)} />
        {/* The second voice, at the rate the reader actually uses at bedtime. */}
        <Sequence from={Math.round(AUDIO.narrationNightDelay * FPS)}>
          <Audio
            src={staticFile(AUDIO.narrationNight)}
            volume={AUDIO.narrationNightVolume}
            playbackRate={AUDIO.narrationNightRate}
          />
        </Sequence>
      </AbsoluteFill>
    </Sequence>

    <Sequence {...frames(BEATS.range)}>
      <StyleRange />
    </Sequence>

    {/* The one human moment in a film otherwise made of software, and it sits
        immediately before the values beat on purpose: showing what the product
        is for earns "No ads. No algorithm. No autoplay." better than stating
        it cold. No caption — the picture does not need explaining, and the
        beat either side of it is already type. */}
    <Sequence {...frames(BEATS.room)}>
      <AbsoluteFill style={{ background: paper.base }}>
        <OffthreadVideo
          src={staticFile(BROLL.room)}
          startFrom={Math.round(1.5 * FPS)}
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
    </Sequence>

    <Sequence {...frames(BEATS.quiet)}>
      <TitleCard lines={COPY.quiet} separators size={50} stagger={sec(2.2)} />
    </Sequence>

    {/* Two passes rather than one, because the promise beat is full-bleed art
        and everything after it is paper. Splitting it keeps the tone an
        explicit statement about each beat instead of a frame-number guess
        buried inside the component. */}
{/* Starts once the mark has introduced itself, and stays. Everything from
        there sits on paper, so a single ink pass covers it. */}
    <Sequence from={sec(BEATS.intake.start)} durationInFrames={sec(BEATS.quiet.end - BEATS.intake.start)}>
      <CornerMark tone="ink" fadeInAt={0} />
    </Sequence>

    <Sequence {...frames(BEATS.close)}>
      <Close />
    </Sequence>
  </AbsoluteFill>
);
};

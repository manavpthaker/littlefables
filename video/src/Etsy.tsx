import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

import { RECORDINGS } from './beats';
import { ease, font, ink, motion, paper, pigment, FPS } from './theme';
import { MarkAnim } from './components/MarkAnim';
import { useHeritageFonts } from './fonts';

const sec = (s: number) => Math.round(s * FPS);
const pendulum = Easing.bezier(...ease.pendulum);
const mechanical = Easing.bezier(...ease.mechanical);

/**
 * The Etsy cut — 15 seconds, square, muted-by-default.
 *
 * Etsy plays listing videos silent and truncates past ~15s, so the film has
 * to be legible with no sound and read from a phone tile. The beats compress
 * the walkthrough to what a stranger needs to see once: a child's name being
 * typed, a style chosen, the book read, the same book at bedtime, the terms.
 *
 * Everything below reuses the walkthrough's own assets and heritage tokens.
 * The intake and end cards are rebuilt in Remotion rather than re-captured
 * because the intake form is now stepped and the close copy has changed.
 */

// -- 0-2.5s ------------------------------------------------------------------

/** iPad bezel used across the cut. Square-friendly, no glossy render theatre. */
const IPad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: paper.base,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        width: 880,
        height: 660,
        padding: 16,
        borderRadius: 24,
        background: ink.base,
        boxShadow: '0 10px 30px rgba(42,29,18,0.16)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 16,
          overflow: 'hidden',
          background: paper.warm,
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  </AbsoluteFill>
);

/**
 * The intake, step one: "What is their name?" with a name being typed in.
 * Rebuilt in Remotion because the live form is stepped now and re-capturing
 * would mean rewriting the Playwright driver for the new flow.
 */
const IntakeStep: React.FC = () => {
  const frame = useCurrentFrame();
  // Rosa, to match the story the reader beat then goes on to open — the
  // book's own text references Rosa by name and mismatched intake/story
  // names read as a scripted demo rather than one child's book.
  const NAME = 'Rosa';
  const startTyping = sec(0.7);
  const cps = 4.5;
  const typed = Math.min(
    NAME.length,
    Math.max(0, Math.floor(((frame - startTyping) / FPS) * cps)),
  );
  const shown = NAME.slice(0, typed);
  // Caret blinks after the word lands, steady while typing.
  const doneAt = startTyping + (NAME.length / cps) * FPS;
  const caretOn = frame < doneAt ? true : Math.floor(frame / 16) % 2 === 0;

  const fadeIn = interpolate(frame, [0, motion.wind], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <IPad>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '38px 60px',
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          gap: 28,
          opacity: fadeIn,
        }}
      >
        {/* progress bar — question 4 of 14, roughly where 'name' sits */}
        <div style={{ display: 'grid', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: font.sc,
              fontSize: 12,
              letterSpacing: '0.14em',
              color: ink.faint,
            }}
          >
            <span>QUESTION 4 OF 14</span>
            <span>29%</span>
          </div>
          <div
            style={{
              height: 3,
              borderRadius: 3,
              background: 'rgba(138,113,86,0.18)',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: '29%', height: '100%', background: pigment.oxblood }} />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20, alignContent: 'start', paddingTop: 24 }}>
          <span
            style={{
              fontFamily: font.sc,
              fontSize: 12,
              letterSpacing: '0.16em',
              color: ink.faint,
            }}
          >
            THE MAIN CHARACTER
          </span>
          <h1
            style={{
              margin: 0,
              fontFamily: font.display,
              fontSize: 42,
              lineHeight: 1.15,
              color: ink.base,
              fontWeight: 400,
            }}
          >
            What is their name?
          </h1>
          <p
            style={{
              margin: 0,
              color: ink.soft,
              fontSize: 17,
              lineHeight: 1.5,
              maxWidth: 560,
            }}
          >
            This is how they&rsquo;ll appear in the story. Nicknames are welcome —
            write it exactly as you&rsquo;d want it printed.
          </p>

          <div
            style={{
              marginTop: 8,
              padding: '14px 18px',
              borderRadius: 10,
              border: `1px solid ${pigment.brass}44`,
              background: paper.base,
              fontFamily: font.body,
              fontSize: 30,
              color: ink.base,
              minHeight: 60,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span>{shown}</span>
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 2,
                height: 34,
                marginLeft: 3,
                background: pigment.oxblood,
                opacity: caretOn ? 1 : 0,
              }}
            />
            {shown.length === 0 && (
              <span style={{ color: ink.faint, fontStyle: 'italic', marginLeft: -4 }}>
                Rosa
              </span>
            )}
          </div>
        </div>
      </div>
    </IPad>
  );
};

// -- 2.5-6s ------------------------------------------------------------------

const PICKED = 1; // the middle one gets the tap

/** Three style previews fan in; one gets picked and scales up. */
const StylePick: React.FC = () => {
  const frame = useCurrentFrame();
  const samples = [
    'sample-1-painted-storybook-single-panel.jpg',
    'sample-2-watercolor-classic-single-panel.jpg',
    'sample-6-crayon-pencil-single-panel.jpg',
  ];
  const labels = ['painted', 'watercolour', 'crayon'];

  const pickAt = sec(2.4); // relative to sequence start (~4.9s absolute)
  const settleAt = sec(2.8);
  const scaleUp = interpolate(frame, [pickAt, settleAt], [1, 1.18], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: pendulum,
  });
  const fadeOthers = interpolate(frame, [pickAt, settleAt], [1, 0.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: mechanical,
  });
  const tapPulse = interpolate(
    frame,
    [pickAt - 3, pickAt + 6, pickAt + 22],
    [0, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return (
    <AbsoluteFill
      style={{
        background: paper.base,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      <div
        style={{
          fontFamily: font.sc,
          fontSize: 14,
          letterSpacing: '0.18em',
          color: ink.faint,
          textTransform: 'uppercase',
        }}
      >
        Choose a style
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
          alignItems: 'center',
          padding: '0 40px',
        }}
      >
        {samples.map((file, i) => {
          const at = Math.round(i * 0.35 * FPS); // stagger the fan-in
          const t = interpolate(frame, [at, at + motion.chime], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: pendulum,
          });
          const isPicked = i === PICKED;
          const rise = (1 - t) * 30;
          const rot = (i - 1) * 3.5 * (1 - Math.min(1, (frame - pickAt) / 12));
          const opacity = isPicked ? t : t * fadeOthers;
          const scale = isPicked ? scaleUp : 1 - (1 - fadeOthers) * 0.08;

          return (
            <div
              key={file}
              style={{
                opacity,
                transform: `translateY(${rise}px) rotate(${rot}deg) scale(${scale})`,
                transformOrigin: 'center center',
                position: 'relative',
              }}
            >
              <Img
                src={staticFile(`styles/${file}`)}
                style={{
                  width: 260,
                  display: 'block',
                  borderRadius: 6,
                  boxShadow: '0 10px 28px rgba(46,33,22,0.24)',
                }}
              />
              <div
                style={{
                  marginTop: 10,
                  textAlign: 'center',
                  fontFamily: font.sc,
                  fontSize: 13,
                  letterSpacing: '0.15em',
                  color: pigment.brass,
                }}
              >
                {labels[i]}
              </div>
              {isPicked && (
                <>
                  {/* the tap ring — a brass halo that pulses out */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: -8,
                      borderRadius: 10,
                      border: `3px solid ${pigment.oxblood}`,
                      opacity: tapPulse * 0.9,
                      transform: `scale(${1 + tapPulse * 0.14})`,
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: -20,
                      borderRadius: 14,
                      border: `2px solid ${pigment.brass}`,
                      opacity: tapPulse * 0.35,
                      transform: `scale(${1 + tapPulse * 0.28})`,
                      pointerEvents: 'none',
                    }}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// -- 6-9.5s ------------------------------------------------------------------

/** The reader, in an iPad: a settled page, then a page turn. */
const ReaderTurn: React.FC = () => {
  return (
    <IPad>
      {/* startFrom picks a settled page one shortly before the turn at 19.5s */}
      <OffthreadVideo
        src={staticFile(RECORDINGS.payoff)}
        startFrom={Math.round(17.5 * FPS)}
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </IPad>
  );
};

// -- 9.5-12s -----------------------------------------------------------------

/** The mode switch: day → night, with a caption. */
const NightFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = interpolate(
    frame,
    [sec(0.9), sec(1.5), sec(2.0), sec(2.4)],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  return (
    <>
      <IPad>
        {/* The capture spends ~7s on shelf → tap → reader-open before the mode
            switch happens. Skip past that entirely and land in settled night
            mode with story text visible — the point of the beat is the palette
            and the second voice, not the flip animation the viewer has no
            context to read at 2.5s and muted. */}
        <OffthreadVideo
          src={staticFile(RECORDINGS.night)}
          startFrom={Math.round(9.5 * FPS)}
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </IPad>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 60,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            opacity: captionIn,
            display: 'grid',
            justifyItems: 'center',
            gap: 10,
          }}
        >
          <span
            aria-hidden
            style={{ width: 72, height: 2, background: pigment.brass, opacity: 0.85 }}
          />
          <span
            style={{
              fontFamily: font.display,
              fontSize: 34,
              color: ink.base,
              textAlign: 'center',
            }}
          >
            and a quieter one for bedtime
          </span>
        </div>
      </AbsoluteFill>
    </>
  );
};

// -- 12-15s ------------------------------------------------------------------

/** End card: the terms, the mark, the shop. */
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const line1 = interpolate(frame, [sec(0.0), sec(0.6)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line2 = interpolate(frame, [sec(0.5), sec(1.1)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line3 = interpolate(frame, [sec(1.0), sec(1.6)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lockup = interpolate(frame, [sec(1.6), sec(2.2)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const terms = [
    'Previews in 24h',
    'Book in 3–4 days',
    'No shipping, ever',
  ];
  const opacities = [line1, line2, line3];

  return (
    <AbsoluteFill
      style={{
        background: paper.base,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 26,
        padding: '0 60px',
      }}
    >
      <div style={{ marginBottom: 6 }}>
        <MarkAnim size={140} mode="grow" />
      </div>

      <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
        {terms.map((line, i) => (
          <div
            key={line}
            style={{
              opacity: opacities[i],
              fontFamily: font.display,
              fontSize: 40,
              color: ink.base,
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 22,
          opacity: lockup,
          display: 'grid',
          justifyItems: 'center',
          gap: 10,
        }}
      >
        <span
          aria-hidden
          style={{ width: 96, height: 2, background: pigment.brass, opacity: 0.85 }}
        />
        <div
          style={{
            fontFamily: font.body,
            fontSize: 26,
            color: ink.soft,
            textAlign: 'center',
          }}
        >
          littlefables.app
        </div>
        <div
          style={{
            fontFamily: font.sc,
            fontSize: 16,
            letterSpacing: '0.16em',
            color: pigment.brass,
            textAlign: 'center',
          }}
        >
          etsy.com/shop/LittleFablesStories
        </div>
      </div>
    </AbsoluteFill>
  );
};

// -- Timing ------------------------------------------------------------------

export const ETSY_FPS = FPS;
export const ETSY_FRAMES = sec(15);

const B = {
  intake: { from: 0, dur: sec(2.5) },
  style: { from: sec(2.5), dur: sec(3.5) },
  reader: { from: sec(6.0), dur: sec(3.5) },
  night: { from: sec(9.5), dur: sec(2.5) },
  close: { from: sec(12.0), dur: sec(3.0) },
} as const;

export const Etsy: React.FC = () => {
  useHeritageFonts();

  return (
    <AbsoluteFill style={{ background: paper.base }}>
      <Sequence from={B.intake.from} durationInFrames={B.intake.dur}>
        <IntakeStep />
      </Sequence>

      <Sequence from={B.style.from} durationInFrames={B.style.dur}>
        <StylePick />
      </Sequence>

      <Sequence from={B.reader.from} durationInFrames={B.reader.dur}>
        <ReaderTurn />
      </Sequence>

      <Sequence from={B.night.from} durationInFrames={B.night.dur}>
        <NightFlip />
      </Sequence>

      <Sequence from={B.close.from} durationInFrames={B.close.dur}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

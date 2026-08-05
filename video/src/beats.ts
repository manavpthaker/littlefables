import { FPS } from './theme';

const sec = (s: number) => Math.round(s * FPS);

/**
 * The film, as data. Changing a headline or a timing means editing this file —
 * not a component. Timings match docs/commerce/walkthrough-video.md.
 */
export interface Beat {
  id: string;
  /** Seconds. Durations are derived from the next beat's start. */
  start: number;
  end: number;
}

/**
 * No brand card at the top. The film opens straight on the product, because a
 * logo is not what earns five more seconds of a stranger's attention — the
 * mark rides in the corner throughout instead, and gets its full draw-on at
 * the close, where a signature belongs.
 */
export const BEATS = {
  promise: { start: 0, end: 7 },
  intake: { start: 7, end: 25 },
  comesTogether: { start: 25, end: 45 },
  arrives: { start: 45, end: 59 },
  payoff: { start: 59, end: 83 },
  night: { start: 83, end: 91 },
  range: { start: 91, end: 98 },
  quiet: { start: 98, end: 106 },
  close: { start: 106, end: 114 },
} as const;

/**
 * Sample spreads for the range beat. Source art and the reasoning behind the
 * three-up layout live in content/marketing/style-samples/README.md.
 */
export const STYLES = [
  { file: 'painterly.png', label: 'painted' },
  { file: 'cutpaper.png', label: 'cut paper' },
  { file: 'woodcut.png', label: 'woodcut' },
] as const;

export const frames = (b: { start: number; end: number }) => ({
  from: sec(b.start),
  durationInFrames: sec(b.end - b.start),
});

export const TOTAL_FRAMES = sec(BEATS.close.end);

/** Book art. Paths are relative to video/public. */
export const BOOK = {
  cover: 'book/cover.png',
  /** The real delivery email, rendered from the design system's EmailShell. */
  email: 'book/email.png',
  pages: Array.from({ length: 8 }, (_, i) => `book/${String(i + 1).padStart(2, '0')}.png`),
};

/**
 * Which recordings actually exist. Anything not listed renders a labelled
 * placeholder rather than failing the build.
 *
 * The five app shots are captured automatically by capture.mjs — Playwright
 * drives the real reader and records it. The two absent ones are not our
 * software: an email client and the iOS share sheet both need a phone.
 */
export const READY = new Set([
  'recordings/02-open.mp4',
  'recordings/03-intake.mp4',
  'recordings/04-page-turn.mp4',
  'recordings/05-word-tap.mp4',
  'recordings/06-transport.mp4',
  'recordings/07-night.mp4',
]);

export const RECORDINGS = {
  email: 'recordings/01-email.mp4',
  intake: 'recordings/03-intake.mp4',
  open: 'recordings/02-open.mp4',
  addToHome: 'recordings/03-add-to-home.mp4',
  pageTurn: 'recordings/04-page-turn.mp4',
  wordTap: 'recordings/05-word-tap.mp4',
  transport: 'recordings/06-transport.mp4',
  night: 'recordings/07-night.mp4',
};

/**
 * Music bed. Drop a file at video/public/audio/bed.mp3 and it plays; until then
 * the film renders silent rather than failing.
 *
 * The mix ducks under the reading beat so the product's own narration is the
 * only voice competing for attention — that beat is the one place the software
 * should be audible.
 */
export const AUDIO = {
  bed: 'audio/bed.mp3',
  /**
   * The book's own narration, pulled from Storage. Page one, day voice —
   * "Rosa was not a patient girl, and she knew it."
   *
   * This is the only voice in the film, and it belongs to the product rather
   * than to an announcer. That is the whole reason the bed ducks here.
   */
  narration: 'audio/narration.mp3',
  narrationVolume: 0.92,
  /** Seconds into the payoff beat before she starts speaking. */
  narrationDelay: 2,
  /** Base level for the bed everywhere else. */
  volume: 0.34,
  /** Level during the reading beat, so narration reads over it. */
  duckedVolume: 0.12,
  duckFrom: BEATS.payoff.start,
  duckTo: BEATS.night.end,
  fadeInSeconds: 1.5,
  fadeOutSeconds: 4,
};

export const COPY = {
  promise: 'Your kid, in their own storybook.',
  intake: 'Tell us about your child',
  intakeSub: 'A photo helps, but words are enough',
  child: ['Rosa.', 'Five.', 'Loves ponds, geese, and waiting for things.'],
  childCoda: 'That was all we asked for.',
  assembled: 'Written, illustrated, and read aloud — in three days.',
  arrives: 'Delivered in days',
  arrivesSub: 'saved to their iPad like a favourite app',
  payoff: ['Read aloud, warmly', 'Their book, their pace', 'Tap any word to hear it'],
  night: 'And a quieter one for bedtime',
  range: 'No two look alike.',
  rangeSub: 'the style comes from the books you already love',
  quiet: [
    'No ads. No algorithm. No autoplay.',
    'It ends when the story ends.',
    'We delete what you told us once the book is delivered.',
  ],
  close: '$29 · previews in 24 hours · book in 3–4 days',
  url: 'littlefables.ai',
};

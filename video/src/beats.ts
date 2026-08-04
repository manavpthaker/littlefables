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

export const BEATS = {
  coldOpen: { start: 0, end: 5 },
  promise: { start: 5, end: 12 },
  intake: { start: 12, end: 30 },
  comesTogether: { start: 30, end: 50 },
  arrives: { start: 50, end: 64 },
  payoff: { start: 64, end: 88 },
  night: { start: 88, end: 96 },
  quiet: { start: 96, end: 104 },
  close: { start: 104, end: 111 },
} as const;

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
  brand: 'Little Fables',
  tagline: 'custom storybooks, made one at a time',
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
  quiet: [
    'No ads. No algorithm. No autoplay.',
    'It ends when the story ends.',
    'We delete what you told us once the book is delivered.',
  ],
  close: '$29 · previews in 24 hours · book in 3–4 days',
  url: 'littlefables.ai',
};

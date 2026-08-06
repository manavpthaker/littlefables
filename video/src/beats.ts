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
  ask: { start: 0, end: 11 },
  /** The mark drawing on — who answers the question. */
  mark: { start: 11, end: 14 },
  intake: { start: 14, end: 32 },
  comesTogether: { start: 32, end: 52 },
  arrives: { start: 52, end: 66 },
  payoff: { start: 66, end: 90 },
  night: { start: 90, end: 102 },
  range: { start: 102, end: 111 },
  /** A room, a grandmother, one of the family's own books on the screen. */
  room: { start: 111, end: 118 },
  quiet: { start: 118, end: 126 },
  close: { start: 126, end: 134 },
} as const;

/**
 * Style samples for the range beat, with the figcaptions the listing page
 * uses — one vocabulary across the film and the shop.
 *
 * These replace three ~615px strips that could only ever be shown small. At
 * 1448x1086 a 3x2 grid puts each near 560px, still a downscale, so the beat
 * can carry six styles instead of three without going soft.
 *
 * Source and the reasoning live in assets/listing/custom-story-page/README.md.
 */
export const STYLES = [
  { file: 'sample-1-painted-storybook-single-panel.jpg', label: 'painted storybook' },
  { file: 'sample-2-watercolor-classic-single-panel.jpg', label: 'watercolor classic' },
  { file: 'sample-3-cut-paper-collage-single-panel.png', label: 'cut-paper collage' },
  { file: 'sample-4-woodcut-ink-single-panel.jpg', label: 'woodcut & ink' },
  { file: 'sample-5-manga-ghibli-single-panel.jpg', label: 'manga & anime' },
  { file: 'sample-6-crayon-pencil-single-panel.jpg', label: 'crayon & pencil' },
] as const;

export const frames = (b: { start: number; end: number }) => ({
  from: sec(b.start),
  durationInFrames: sec(b.end - b.start),
});

export const TOTAL_FRAMES = sec(BEATS.close.end);

/** Book art. Paths are relative to video/public. */
/**
 * Lifestyle plate. Muted deliberately — its own audio is a generated voice
 * that does not match the mouth, and the film already has two real voices in
 * it. The picture is the whole contribution.
 *
 * The screen is genuine: Mikey the Moto, one of the family's own books, in the
 * reader's landscape layout.
 */
export const BROLL = {
  room: 'broll/grandmother-and-grandson.mp4',
};

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
  'recordings/06-payoff.mp4',
  'recordings/07-night.mp4',
]);

export const RECORDINGS = {
  /** Unused by the current cut, which renders the email from EmailShell. */
  email: 'recordings/01-email.mp4',
  intake: 'recordings/03-intake.mp4',
  open: 'recordings/02-open.mp4',
  pageTurn: 'recordings/04-page-turn.mp4',
  wordTap: 'recordings/05-word-tap.mp4',
  payoff: 'recordings/06-payoff.mp4',
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
  /** The bedtime voice is softly spoken by design, so it needs more gain than
   *  the day voice to clear the bed by the same margin. */
  narrationNightVolume: 1,
  /**
   * The same page in the bedtime voice. This is the only place in the film
   * where the second voice is audible, and it is the one thing that proves
   * night is a different reading rather than a palette swap — the caption
   * claimed it and nothing demonstrated it.
   *
   * Played at 0.9, which is what the reader applies at bedtime
   * (BEDTIME_VOICE.rate), so the film hears what a child hears: 9.9s of
   * narration becomes about 11.
   */
  narrationNight: 'audio/narration-night.mp3',
  narrationNightRate: 0.9,
  /** Seconds into the night beat before the sleepy voice starts. */
  narrationNightDelay: 0.6,
  /** Seconds into the payoff beat before she starts speaking. */
  /**
   * The beat joins just after play is pressed, so the voice starts almost at
   * once. It runs 9.9s and the page turns at 12.0s — the page is finished
   * being read before it is turned, which is the whole point of the beat.
   */
  narrationDelay: 0.3,
  /** Base level for the bed everywhere else. */
  volume: 0.34,
  /** Level during the reading beat, so narration reads over it. */
  duckedVolume: 0.12,
  /**
   * The duck exists to make room for the voice, so it tracks the voice rather
   * than a beat boundary. Ducking to the end of the night beat left twenty-two
   * seconds — the page turn, the word tap, the whole night beat — sitting at
   * about -29 dB with nothing over it, which reads as the audio dropping out
   * rather than as restraint.
   */
  /**
   * The bed steps down wherever a voice is speaking, and comes back when it
   * stops. Two windows now, one per voice — the duck used to run from the
   * first voice all the way to the end of night, which left twenty-two seconds
   * at about -29 dB with nothing over it.
   */
  ducks: [
    { from: BEATS.payoff.start, to: BEATS.payoff.start + 0.3 + 9.9 + 1.2 },
    // The bedtime read is 9.9 dB quieter at source than the day one — it is
    // genuinely hushed, which is the point of it. Gaining the file up would
    // throw that away, so the bed steps further out of its way instead. Suits
    // the beat: everything should be quieter here, not just the voice louder.
    { from: BEATS.night.start, to: BEATS.night.start + 0.6 + 9.9 / 0.9 + 1.0, level: 0.05 },
  ],
  fadeInSeconds: 1.5,
  fadeOutSeconds: 4,
};

export const COPY = {
  /**
   * The film opens on the question, not the product. This is the sentence a
   * parent writes at eight in the evening — a specific child, a specific
   * problem, and the answer they do not want.
   *
   * The problem has to be the one the delivered book answers. This said "she
   * loves horses" first, and then the film handed over a book about a pond, a
   * lantern and a grandmother — breaking the only promise the film makes, that
   * these words become that book. Impatience is what the book is actually
   * about: Rosa waiting to see who lights the lantern, and Grandma June
   * telling her that waiting is the whole of it.
   *
   * It also sets up the beat at the far end: "No ads. No algorithm. No
   * autoplay."
   */
  ask: [
    'Rosa is five. She wants everything to happen now —',
    'the cake, the bus, her own birthday.',
    'Is there anything for her that isn’t YouTube?',
  ],
  intake: 'This is everything we ask.',
  intakeSub: 'A photo helps, but words are enough',
  child: ['Rosa.', 'Five.', 'Loves ponds, geese, and waiting for things.'],
  childCoda: 'That was all we asked for.',
  assembled: 'Your kid, in their own storybook.',
  arrives: 'Delivered in days',
  arrivesSub: 'saved to their iPad like a favourite app',
  payoff: ['Read aloud, warmly', 'Their book, their pace', 'Tap any word to hear it'],
  /**
   * Seconds into the payoff beat at which each caption lands, measured off
   * 06-payoff.mp4: the page turns 12.0s in and a word is tapped at 17.0s.
   * Keep these with the recording, not the component — a re-capture that
   * shifts the actions has to shift these too.
   */
  payoffAt: [0.8, 11.5, 16.5],
  night: 'And a quieter one for bedtime',
  range: 'No two look alike.',
  rangeSub: 'the style comes from the books you already love',
  quiet: [
    'No ads. No algorithm. No autoplay.',
    'It ends when the story ends.',
    'We delete what you told us once the book is delivered.',
  ],
  close: '$29 · previews in 24 hours · book in 3–4 days',
  url: 'littlefables.app',
  etsy: 'etsy.com/shop/LittleFablesStories',
};

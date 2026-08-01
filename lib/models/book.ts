import { z } from 'zod';

// AUDIT C2 fix: the enum values below are the single source of truth for
// Book.kind / .source / .status. The migration file's CHECK constraints must
// match these lists — tests/models/schema-sync.spec.ts asserts equality.

export const BOOK_KINDS = ['quick', 'chapter'] as const;
export const BOOK_SOURCES = ['family', 'family-original', 'generated', 'starter'] as const;
export const BOOK_STATUSES = [
  'draft',
  'checking',
  'published',
  'needs-review',
  'blocked',
  'unverified',
  'complete',
  'awaiting-choice',
] as const;

// Page shape — pack-000 uses text + star; generated content (Phase 3+) can
// additionally carry ask/choice/breathe interactivity per PRD A4.
export const askBlockSchema = z.object({
  prompt: z.string(),
  accept: z.array(z.string()).default([]),
});

export const choiceBlockSchema = z.object({
  prompt: z.string(),
  options: z.array(z.object({ label: z.string(), summary: z.string() })).min(2),
});

// Illustration hotspot (redesign brief §VI): a tappable point over approved
// scene art that speaks what it is. Coordinates are normalized 0..1 so they
// survive any render size. Max 3 per page; only pages with art carry them.
export const hotspotSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  label: z.string().min(1).max(40),
  emoji: z.string().max(8).optional(),
  spoken: z.string().min(1).max(120),
});
export type Hotspot = z.infer<typeof hotspotSchema>;

export const pageSchema = z
  .object({
    text: z.string(),
    star: z.string().optional(),
    ask: askBlockSchema.optional(),
    choice: choiceBlockSchema.optional(),
    breathe: z.boolean().optional(),
    hotspots: z.array(hotspotSchema).max(3).optional(),
  })
  .passthrough();

export type AskBlock = z.infer<typeof askBlockSchema>;
export type ChoiceBlock = z.infer<typeof choiceBlockSchema>;

export const chapterSchema = z
  .object({
    title: z.string(),
    wash: z.string().optional(),
    pages: z.array(pageSchema).min(1),
  })
  .passthrough();

// Per-book vocab. `syllables` powers the "bur — row" split; either
// `kidDefinition` or `meaning` (or both) can carry the definition text.
// Both are optional so the field can be a bare tap-to-hear entry when the
// author didn't write a definition. `meaning` stays in the schema for
// backward compatibility with older seed data.
export const vocabEntrySchema = z.object({
  word: z.string(),
  meaning: z.string().optional(),
  syllables: z.array(z.string().min(1)).optional(),
  kidDefinition: z.string().optional(),
});

// Optional per-book palette. When present, the reader chrome (page paper,
// story text, eyebrow, current-word highlight, play button, muted captions)
// re-tints to match the illustration atmosphere — so opening The Midnight
// Train reads as a nocturne and opening The Moose reads as a warm sunset.
// Night mode always wins over any book theme (bedtime pacing is protected).
// All four fields optional so a partial theme still parses; the reader
// merges what's present onto the base tokens.
export const bookThemeSchema = z.object({
  /** Page background — replaces --surface-page. */
  paper: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional(),
  /** Body text — replaces --ink / --text-strong / --text-body. */
  ink: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional(),
  /** Eyebrow, current-word highlight, play button — replaces --action /
   *  --marigold family. Pick a color that actually appears in the art. */
  accent: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional(),
  /** Upcoming-word dim, captions, muted chrome — replaces --ink-soft /
   *  --text-muted. Something between ink and paper on the value scale. */
  hush: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional(),
});
export type BookTheme = z.infer<typeof bookThemeSchema>;

// Per-character voice cast. Character name (as spelled in the story text)
// → ElevenLabs voice id. The narrate script parses quoted dialogue and
// routes each character's lines to their voice; anything unattributed
// falls back to the household narrator voice.
export const characterVoiceSchema = z.object({
  voiceId: z.string().min(1).max(64),
  /** Optional bedtime-cast voice id — used when the reader is in night
   *  mode. Falls back to voiceId when absent. */
  nightVoiceId: z.string().min(1).max(64).optional(),
});
export type CharacterVoice = z.infer<typeof characterVoiceSchema>;

export const bookSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    by: z.string().optional(),
    kind: z.enum(BOOK_KINDS),
    source: z.enum(BOOK_SOURCES),
    status: z.enum(BOOK_STATUSES),
    coverEmoji: z.string().nullable().optional(),
    coverImage: z.string().optional(),
    coverBg: z.string().optional(),
    vocab: z.array(vocabEntrySchema).default([]),
    originNote: z.string().nullable().optional(),
    theme: bookThemeSchema.optional(),
    /** Character voice cast for this book. Keys are the character names
     *  as spelled in the story text ("Bramble", "Mose"). */
    characters: z.record(z.string(), characterVoiceSchema).optional(),
    /** Per-book pronunciation overrides. Merges with the global
     *  content/pronunciations.json; per-book wins on conflicts. */
    pronunciations: z.record(z.string(), z.string().max(80)).optional(),
    chapters: z.array(chapterSchema).min(1),
  })
  .passthrough();

export type Book = z.infer<typeof bookSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type Page = z.infer<typeof pageSchema>;
export type VocabEntry = z.infer<typeof vocabEntrySchema>;
export type BookKind = (typeof BOOK_KINDS)[number];
export type BookSource = (typeof BOOK_SOURCES)[number];
export type BookStatus = (typeof BOOK_STATUSES)[number];

export const packSchema = z.object({
  pack: z.string(),
  note: z.string().optional(),
  stories: z.array(bookSchema),
});
export type Pack = z.infer<typeof packSchema>;

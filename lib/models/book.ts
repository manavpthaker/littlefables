import { z } from 'zod';
import { LAYER_TAGS } from './layer-tags';

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

// syllables + kidDefinition are the collectable-word depth from the redesign
// brief (extends PRD A9): "bur — row", then a definition in kid language.
// Optional so pre-backfill books still parse.
export const vocabEntrySchema = z.object({
  word: z.string(),
  meaning: z.string(),
  syllables: z.array(z.string().min(1)).optional(),
  kidDefinition: z.string().optional(),
});

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
    teachingGoals: z.array(z.string()).default([]),
    vocab: z.array(vocabEntrySchema).default([]),
    retellPrompts: z.array(z.string()).default([]),
    // Redesign brief additions (backfilled for pack-000, authored by the Maker
    // for new books). layerTag drives shelf grouping + cover chips; beats are
    // the retell story-spine (3–5 short story facts in order).
    layerTag: z.enum(LAYER_TAGS).optional(),
    beats: z.array(z.string().min(1).max(120)).max(6).default([]),
    parentGuide: z.string().nullable().optional(),
    originNote: z.string().nullable().optional(),
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

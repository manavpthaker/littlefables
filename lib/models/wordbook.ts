import { z } from 'zod';

// Wire body for POST /api/child/wordbook — validated at the route boundary.
// The word field accepts the STEM (lowercase, edge-punct stripped); the reader
// computes stems client-side via stemOf() in lib/reader/state.
export const saveWordSchema = z.object({
  word: z
    .string()
    .min(2)
    .max(18)
    .regex(/^[\p{L}]+(?:['\u2019-][\p{L}]+)*$/u, 'stem must be a clean word'),
  sentence: z.string().max(500).optional(),
  bookId: z.string().max(120).optional(),
  chapterIdx: z.number().int().min(0).optional(),
  pageIdx: z.number().int().min(0).optional(),
});
export type SaveWordInput = z.infer<typeof saveWordSchema>;

export const wordbookEntrySchema = z.object({
  id: z.string(),
  word: z.string(),
  meaning: z.string().nullable(),
  sentence: z.string().nullable(),
  bookId: z.string().nullable(),
  savedAt: z.string(),
  ownedAt: z.string().nullable(),
});
export type WordbookEntry = z.infer<typeof wordbookEntrySchema>;

export const saveWordResponseSchema = z.object({
  entry: wordbookEntrySchema,
  newlyEarned: z.array(z.string()).default([]),
});
export type SaveWordResponse = z.infer<typeof saveWordResponseSchema>;

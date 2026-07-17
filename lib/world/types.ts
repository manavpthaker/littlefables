import { z } from 'zod';

// The world_state.data jsonb payload. Kept intentionally shallow — only fields
// the client renders live here. Records that grow indefinitely (wordbook,
// comprehension records, badges) have their own tables.

export const worldStateSchema = z.object({
  activeBuddyId: z.string().default('char_bramble'),
  latestCallback: z.string().nullable().default(null),
  growth: z
    .object({
      booksOpened: z.number().int().min(0).default(0),
      wordsSaved: z.number().int().min(0).default(0),
      daysRead: z.number().int().min(0).default(0),
      checkpointsAsked: z.number().int().min(0).default(0),
      checkpointsCorrect: z.number().int().min(0).default(0),
    })
    .default({
      booksOpened: 0,
      wordsSaved: 0,
      daysRead: 0,
      checkpointsAsked: 0,
      checkpointsCorrect: 0,
    }),
});
export type WorldStateData = z.infer<typeof worldStateSchema>;

// Aggregate payload the Home surface asks for in one shot. Keeps mount to
// exactly one round trip — Phase 1's shelf still runs on RSC + admin() reads,
// but the Home Buddy needs richer data than the shelf, so we expose it via API.
export interface WorldBundle {
  world: WorldStateData;
  readingDays: string[]; // ISO date strings, last 7 days
  todayEarned: boolean;
  todayIdx: number; // 0 = Mon .. 6 = Sun (PRD B3 week convention)
  badges: string[]; // earned slugs
  recentWords: Array<{ word: string; savedAt: string }>;
  recentBooks: Array<{ id: string; title: string }>; // most recently opened
}

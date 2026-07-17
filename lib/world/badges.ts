import { admin } from '@/lib/supabase/admin';
import type { WorldStateData } from './types';

// Pure badge evaluators + a helper that inserts + returns newly-earned rows.
// Evaluators are deterministic on world state alone — testable without a DB.

export interface BadgeEvalInput {
  world: WorldStateData;
  readingDaysCount: number;
  hasSavedWord: boolean;
  hasCorrectCheckpoint: boolean;
}

const RULES: Array<{
  slug: string;
  test: (input: BadgeEvalInput) => boolean;
}> = [
  {
    slug: 'first-book-opened',
    test: ({ world }) => world.growth.booksOpened >= 1,
  },
  {
    slug: 'first-word-saved',
    test: ({ hasSavedWord }) => hasSavedWord,
  },
  {
    slug: 'first-checkpoint-correct',
    test: ({ hasCorrectCheckpoint }) => hasCorrectCheckpoint,
  },
  {
    slug: 'reading-streak-3',
    test: ({ readingDaysCount }) => readingDaysCount >= 3,
  },
  {
    slug: 'reading-streak-7',
    test: ({ readingDaysCount }) => readingDaysCount >= 7,
  },
];

/** Which slugs qualify given the current input. Pure. */
export function evaluateBadges(input: BadgeEvalInput): string[] {
  return RULES.filter((r) => r.test(input)).map((r) => r.slug);
}

/** Insert any new badges + return the just-earned slugs. Idempotent — the
 *  DB unique constraint on (child_id, badge_slug) is the source of truth. */
export async function insertNewBadges(childId: string, slugs: string[]): Promise<string[]> {
  if (slugs.length === 0) return [];
  const rows = slugs.map((slug) => ({ child_id: childId, badge_slug: slug }));
  const { data, error } = await admin()
    .from('badges')
    .upsert(rows, { onConflict: 'child_id,badge_slug', ignoreDuplicates: true })
    .select('badge_slug');
  if (error) return [];
  return (data ?? []).map((r) => r.badge_slug);
}

export async function loadEarnedBadges(childId: string): Promise<string[]> {
  const { data } = await admin()
    .from('badges')
    .select('badge_slug')
    .eq('child_id', childId);
  return (data ?? []).map((r) => r.badge_slug);
}

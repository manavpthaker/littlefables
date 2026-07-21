'use client';

import { BadgeShelf } from '@ds/components/world/BadgeShelf.jsx';
import { BADGE_CATALOG, badgeDisplay } from '@/lib/world/badge-catalog';

// Home badge strip: shows what he's earned + one or two locked next-up
// silhouettes with a legible-but-magical hint (Polish VI.2 — no bare "?").

const LOCKED_HINTS: Record<string, string> = {
  'first-book-opened': 'Open a story to wake this one',
  'first-word-saved': 'Star a word to keep it',
  'first-checkpoint-correct': 'Answer a story question',
  'reading-streak-3': 'Read 3 days in a row',
  'reading-streak-7': 'Read 7 days in a row',
};

export function BadgeStrip({ earned }: { earned: string[] }) {
  const earnedSet = new Set(earned);
  const allSlugs = Object.keys(BADGE_CATALOG);
  const lockedNext = allSlugs.filter((s) => !earnedSet.has(s)).slice(0, 2);

  const badges = [
    ...earned.map((slug) => {
      const b = badgeDisplay(slug);
      return { name: b.name, icon: b.icon, earned: true, color: b.color };
    }),
    ...lockedNext.map((slug) => {
      const b = badgeDisplay(slug);
      return { name: b.name, icon: b.icon, earned: false, color: b.color, hint: LOCKED_HINTS[slug] };
    }),
  ];

  if (badges.length === 0) return null;

  return (
    <section style={{ padding: '0 var(--page-pad)' }}>
      <BadgeShelf badges={badges} />
    </section>
  );
}

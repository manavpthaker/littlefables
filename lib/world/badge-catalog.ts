// Human-facing display for badge slugs. The slugs are the DB source of truth;
// this catalog turns them into names + colors + icons for celebration & shelf.

export interface BadgeDisplay {
  slug: string;
  name: string;
  icon: string;
  color: string;
  utterance?: string;
}

export const BADGE_CATALOG: Readonly<Record<string, BadgeDisplay>> = {
  'first-book-opened': {
    slug: 'first-book-opened',
    name: 'First Story',
    icon: 'book',
    color: 'var(--marigold)',
    utterance: 'You opened your first story!',
  },
  'first-word-saved': {
    slug: 'first-word-saved',
    name: 'Word Collector',
    icon: 'star',
    color: 'var(--marigold)',
    utterance: 'You saved your first word!',
  },
  'first-checkpoint-correct': {
    slug: 'first-checkpoint-correct',
    name: 'Story Listener',
    icon: 'ear',
    color: 'var(--teal)',
    utterance: 'You listened so well!',
  },
  'reading-streak-3': {
    slug: 'reading-streak-3',
    name: '3-Day Sun',
    icon: 'sun',
    color: 'var(--marigold)',
    utterance: 'Three reading days in a row!',
  },
  'reading-streak-7': {
    slug: 'reading-streak-7',
    name: 'Week of Suns',
    icon: 'sun',
    color: 'var(--marigold)',
    utterance: 'A whole week of reading!',
  },
};

export function badgeDisplay(slug: string): BadgeDisplay {
  return (
    BADGE_CATALOG[slug] ?? {
      slug,
      name: slug,
      icon: 'star',
      color: 'var(--marigold)',
    }
  );
}

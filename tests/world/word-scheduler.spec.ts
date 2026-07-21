import { describe, expect, it } from 'vitest';
import { dueWords, isDue, pickGreetingWord, type SchedulableWord } from '@/lib/world/word-scheduler';

// PRD B5 spacing: fresh words come due after 2 days, met words after 7,
// owned words after 21. Stalest first.

const NOW = new Date('2026-07-21T12:00:00Z');

function word(overrides: Partial<SchedulableWord>): SchedulableWord {
  return {
    word: 'vast',
    savedAt: '2026-07-01T00:00:00Z',
    ownedAt: null,
    lastEncounterAt: null,
    encounterCount: 0,
    ...overrides,
  };
}

function daysAgo(n: number): string {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
}

describe('isDue', () => {
  it('fresh word: due after 2 days', () => {
    expect(isDue(word({ savedAt: daysAgo(1) }), NOW)).toBe(false);
    expect(isDue(word({ savedAt: daysAgo(3) }), NOW)).toBe(true);
  });

  it('met word: due after 7 days from the last encounter', () => {
    const w = word({ savedAt: daysAgo(30), lastEncounterAt: daysAgo(5), encounterCount: 2 });
    expect(isDue(w, NOW)).toBe(false);
    expect(isDue({ ...w, lastEncounterAt: daysAgo(8) }, NOW)).toBe(true);
  });

  it('owned word: rests for 21 days', () => {
    const w = word({ savedAt: daysAgo(40), ownedAt: daysAgo(10), lastEncounterAt: daysAgo(10), encounterCount: 3 });
    expect(isDue(w, NOW)).toBe(false);
    expect(isDue({ ...w, lastEncounterAt: daysAgo(22) }, NOW)).toBe(true);
  });

  it('the later of savedAt/lastEncounterAt is the touch point', () => {
    expect(isDue(word({ savedAt: daysAgo(10), lastEncounterAt: daysAgo(1), encounterCount: 1 }), NOW)).toBe(false);
  });
});

describe('dueWords ordering', () => {
  it('stalest first', () => {
    const stale = word({ word: 'gentle', savedAt: daysAgo(20) });
    const fresher = word({ word: 'furious', savedAt: daysAgo(4) });
    expect(dueWords([fresher, stale], NOW).map((w) => w.word)).toEqual(['gentle', 'furious']);
  });
});

describe('pickGreetingWord', () => {
  it('null when nothing is due', () => {
    expect(pickGreetingWord([word({ savedAt: daysAgo(1) })], NOW)).toBeNull();
  });

  it('returns the stalest due word', () => {
    const entries = [word({ word: 'brave', savedAt: daysAgo(3) }), word({ word: 'vast', savedAt: daysAgo(9) })];
    expect(pickGreetingWord(entries, NOW)).toBe('vast');
  });
});

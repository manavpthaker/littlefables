import { describe, expect, it } from 'vitest';
import { composeGreeting } from '@/lib/world/greeting';
import { activeBuddy } from '@/lib/world/buddy-roster';
import { worldStateSchema } from '@/lib/world/types';
import type { WorldBundle } from '@/lib/world/types';

function bundle(overrides: Partial<WorldBundle> = {}): WorldBundle {
  return {
    world: worldStateSchema.parse({}),
    readingDays: [],
    todayEarned: false,
    todayIdx: 0,
    badges: [],
    recentWords: [],
    recentBooks: [],
    ...overrides,
  };
}

describe('composeGreeting', () => {
  const bramble = activeBuddy('char_bramble');

  it('brand-new device gets welcome tone', () => {
    const g = composeGreeting(bundle(), bramble);
    expect(g.tone).toBe('welcome');
    expect(g.utterance).toContain('Bramble');
  });

  it('recent book gets callback tone with book title', () => {
    const g = composeGreeting(
      bundle({
        world: worldStateSchema.parse({ growth: { booksOpened: 1, wordsSaved: 0, daysRead: 1, checkpointsAsked: 0, checkpointsCorrect: 0 } }),
        recentBooks: [{ id: 'b', title: "Bramble's Hello" }],
      }),
      bramble,
    );
    expect(g.tone).toBe('callback');
    expect(g.utterance).toContain("Bramble's Hello");
  });

  it('recent word gets word tone', () => {
    const g = composeGreeting(
      bundle({
        world: worldStateSchema.parse({ growth: { booksOpened: 1, wordsSaved: 1, daysRead: 0, checkpointsAsked: 0, checkpointsCorrect: 0 } }),
        recentBooks: [],
        recentWords: [{ word: 'brave', savedAt: '2026-07-16T00:00:00Z' }],
      }),
      bramble,
    );
    expect(g.tone).toBe('word');
    expect(g.utterance).toContain('brave');
  });

  it('streak of >=3 gets streak tone', () => {
    const g = composeGreeting(
      bundle({
        world: worldStateSchema.parse({ growth: { booksOpened: 3, wordsSaved: 0, daysRead: 3, checkpointsAsked: 0, checkpointsCorrect: 0 } }),
        readingDays: ['2026-07-15', '2026-07-16', '2026-07-17'],
      }),
      bramble,
    );
    expect(g.tone).toBe('streak');
    expect(g.utterance).toContain('3');
  });

  it('falls back to default with the buddy catchphrase', () => {
    const g = composeGreeting(
      bundle({
        world: worldStateSchema.parse({ growth: { booksOpened: 1, wordsSaved: 0, daysRead: 1, checkpointsAsked: 0, checkpointsCorrect: 0 } }),
      }),
      bramble,
    );
    expect(g.tone).toBe('default');
    expect(g.utterance).toContain("brave together");
  });
});

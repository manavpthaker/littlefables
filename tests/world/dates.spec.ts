import { describe, expect, it } from 'vitest';
import { isoToWeekIdx, todayIsoUtc, weekWindowUtc } from '@/lib/world/dates';

describe('date helpers', () => {
  it('todayIsoUtc returns YYYY-MM-DD', () => {
    expect(/^\d{4}-\d{2}-\d{2}$/.test(todayIsoUtc(new Date('2026-07-17T14:00:00Z')))).toBe(true);
  });

  it('isoToWeekIdx maps Monday=0, Sunday=6', () => {
    expect(isoToWeekIdx('2026-07-13')).toBe(0); // Monday
    expect(isoToWeekIdx('2026-07-19')).toBe(6); // Sunday
  });

  it('weekWindowUtc returns 7 sorted ISO strings covering the week', () => {
    const w = weekWindowUtc(new Date('2026-07-17T14:00:00Z')); // Friday
    expect(w).toHaveLength(7);
    expect(w[0]).toBe('2026-07-13'); // Monday
    expect(w[6]).toBe('2026-07-19'); // Sunday
  });
});

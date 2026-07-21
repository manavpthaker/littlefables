// Date helpers for reading-day tracking. PRD B3: week convention is Mon-Sun,
// index 0 = Monday. All dates are compared as UTC ISO date strings (YYYY-MM-DD)
// — the client's local midnight is what a kid actually experiences.

export function todayIsoUtc(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 0 = Monday .. 6 = Sunday (PRD B3). */
export function isoToWeekIdx(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  const dayIdx = date.getUTCDay(); // 0=Sun..6=Sat
  return (dayIdx + 6) % 7;
}

/** Returns ISO strings for Monday..Sunday of the week containing `today`. */
export function weekWindowUtc(today: Date = new Date()): string[] {
  const idx = isoToWeekIdx(todayIsoUtc(today));
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - idx + i);
    days.push(todayIsoUtc(d));
  }
  return days;
}

/** Consecutive-day streak ending today (or yesterday — an unbroken run that
 *  hasn't been read *yet* today still counts). days = ISO date strings. */
export function streakLength(days: string[], today: string = todayIsoUtc()): number {
  const set = new Set(days);
  const start = set.has(today) ? today : previousIso(today);
  if (!set.has(start)) return 0;
  let streak = 0;
  let cursor = start;
  while (set.has(cursor)) {
    streak += 1;
    cursor = previousIso(cursor);
  }
  return streak;
}

function previousIso(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  date.setUTCDate(date.getUTCDate() - 1);
  return todayIsoUtc(date);
}

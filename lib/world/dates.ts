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

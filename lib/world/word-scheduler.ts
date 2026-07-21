// Spaced re-encounter scheduling for saved words (PRD B5, redesign brief §II.5).
// Pure — table-testable. A word is DUE when enough time has passed since it
// was last touched (saved or re-encountered): 2 days for a fresh word, 7 days
// once it's been met again, 21 days after it's owned. Due words are woven
// into checkpoint questions and the Home greeting; a due word understood at a
// checkpoint becomes OWNED (star fills in).

export interface SchedulableWord {
  word: string;
  savedAt: string;
  ownedAt: string | null;
  lastEncounterAt: string | null;
  encounterCount: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const FRESH_INTERVAL = 2 * DAY_MS;
const MET_INTERVAL = 7 * DAY_MS;
const OWNED_INTERVAL = 21 * DAY_MS;

function lastTouch(w: SchedulableWord): number {
  const saved = Date.parse(w.savedAt);
  const met = w.lastEncounterAt ? Date.parse(w.lastEncounterAt) : Number.NaN;
  return Number.isFinite(met) ? Math.max(saved, met) : saved;
}

function intervalFor(w: SchedulableWord): number {
  if (w.ownedAt) return OWNED_INTERVAL;
  return w.encounterCount > 0 ? MET_INTERVAL : FRESH_INTERVAL;
}

export function isDue(w: SchedulableWord, now: Date): boolean {
  const touch = lastTouch(w);
  if (!Number.isFinite(touch)) return false;
  return now.getTime() - touch >= intervalFor(w);
}

/** Due words, stalest first — the longest-neglected word gets re-met first. */
export function dueWords(entries: SchedulableWord[], now: Date): SchedulableWord[] {
  return entries
    .filter((w) => isDue(w, now))
    .sort((a, b) => lastTouch(a) - lastTouch(b));
}

/** One due word for the Home greeting slot, or null when nothing is due. */
export function pickGreetingWord(entries: SchedulableWord[], now: Date): string | null {
  const due = dueWords(entries, now);
  return due[0]?.word ?? null;
}

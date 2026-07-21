import { z } from 'zod';
import { CHILD_BANDS } from './child';

// Child settings (redesign brief §III.5 Settings tab), stored in
// children.settings jsonb (migration 20260721000012). Parent-set only; the
// child never sees any of these. Partial-merge on PUT: absent keys keep their
// stored value; parse always yields a complete object via defaults.

export const READING_LEVELS = ['ease', 'auto', 'stretch'] as const;
export type ReadingLevel = (typeof READING_LEVELS)[number];

export const bedtimeWindowSchema = z.object({
  enabled: z.boolean().default(false),
  // Local hours, 0–23. Window may cross midnight (e.g. 19 → 6).
  startHour: z.number().int().min(0).max(23).default(19),
  endHour: z.number().int().min(0).max(23).default(6),
});
export type BedtimeWindow = z.infer<typeof bedtimeWindowSchema>;

export const childSettingsSchema = z.object({
  readingLevel: z.enum(READING_LEVELS).default('auto'),
  checksEnabled: z.boolean().default(true),
  bedtime: bedtimeWindowSchema.default({ enabled: false, startHour: 19, endHour: 6 }),
  // Minutes per day; null = no limit. Soft: the buddy suggests stopping,
  // never a lock (DS rules — no gates, no red).
  dailyLimitMin: z.number().int().min(5).max(240).nullable().default(null),
  // Overrides NARRATOR_VOICE_ID for live TTS when set. Pre-generated page
  // narration keeps its recorded voice until regenerated.
  narratorVoiceId: z.string().max(64).nullable().default(null),
});
export type ChildSettings = z.infer<typeof childSettingsSchema>;

export const updateSettingsBodySchema = z.object({
  childId: z.string().uuid(),
  settings: childSettingsSchema.partial(),
  band: z.enum(CHILD_BANDS).optional(),
});
export type UpdateSettingsInput = z.infer<typeof updateSettingsBodySchema>;

export function parseChildSettings(raw: unknown): ChildSettings {
  const parsed = childSettingsSchema.safeParse(raw ?? {});
  if (parsed.success) return parsed.data;
  // Fail soft: a malformed blob (hand-edited row, older shape) degrades to
  // defaults instead of breaking the reader or Parent Corner.
  return childSettingsSchema.parse({});
}

export function isInBedtimeWindow(bedtime: BedtimeWindow, hour: number): boolean {
  if (!bedtime.enabled) return false;
  const { startHour, endHour } = bedtime;
  if (startHour === endHour) return true;
  if (startHour < endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour; // crosses midnight
}

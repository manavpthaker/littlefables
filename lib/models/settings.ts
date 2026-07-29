import { z } from 'zod';
import { CHILD_BANDS } from './child';

// Child settings — stored on children.settings jsonb. Pared-back to just
// the bedtime window + voice preferences. Parent-set only.

export const bedtimeWindowSchema = z.object({
  enabled: z.boolean().default(false),
  // Local hours, 0–23. Window may cross midnight (e.g. 19 → 6).
  startHour: z.number().int().min(0).max(23).default(19),
  endHour: z.number().int().min(0).max(23).default(6),
});
export type BedtimeWindow = z.infer<typeof bedtimeWindowSchema>;

export const childSettingsSchema = z.object({
  bedtime: bedtimeWindowSchema.default({ enabled: false, startHour: 19, endHour: 6 }),
  // Optional per-child voice overrides. When null, the env DAY_VOICE_ID /
  // NIGHT_VOICE_ID applies. `narratorVoiceId` is the legacy key — the API
  // route still reads it as the day-mode override so existing rows work.
  narratorVoiceId: z.string().max(64).nullable().default(null),
  nightVoiceId: z.string().max(64).nullable().default(null),
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
  return childSettingsSchema.parse({});
}

export function isInBedtimeWindow(bedtime: BedtimeWindow, hour: number): boolean {
  if (!bedtime.enabled) return false;
  const { startHour, endHour } = bedtime;
  if (startHour === endHour) return true;
  if (startHour < endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour;
}

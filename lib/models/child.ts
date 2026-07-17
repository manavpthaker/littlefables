import { z } from 'zod';

// Bands mirror the archive's normalizeBand fallback ordering.
// Server-side generation MUST pass band explicitly (audit C4 fix) — never default.
export const CHILD_BANDS = ['3-4', '4-6', '4-8', '6-8'] as const;
export type ChildBand = (typeof CHILD_BANDS)[number];

export const childSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  displayName: z.string().min(1),
  band: z.enum(CHILD_BANDS).default('4-8'),
  excludeTerms: z.array(z.string()).default([]),
  pronouns: z.string().nullable().optional(),
});
export type Child = z.infer<typeof childSchema>;

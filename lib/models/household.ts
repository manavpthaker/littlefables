import { z } from 'zod';

export const householdSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Household = z.infer<typeof householdSchema>;

export const parentSchema = z.object({
  id: z.string().uuid(),
  householdId: z.string().uuid(),
  authUserId: z.string().uuid().nullable(),
  email: z.string().email(),
  displayName: z.string().nullable().optional(),
});
export type Parent = z.infer<typeof parentSchema>;

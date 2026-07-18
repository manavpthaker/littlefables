import { admin } from '@/lib/supabase/admin';

// Single-household resolution for the parent surface (S4.2). Removes the
// SEED_HOUSEHOLD_ID hardcode from app code. When we move to multi-household
// (V2 wave 2.5), swap the picker to read the household_id from the parent
// gate cookie — same call sites, different implementation.

let cachedId: string | null = null;

/** Household id the parent surface currently operates on. In single-household
 *  mode this is the first (and only) row in `households`. Cached at module
 *  level within a server runtime so this is one query per process. */
export async function currentHouseholdId(): Promise<string> {
  if (cachedId) return cachedId;
  const { data, error } = await admin()
    .from('households')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data?.id) throw new Error('No household found — provision one via scripts/new-household.ts');
  cachedId = data.id;
  return cachedId;
}

/** Cheap membership check — throws if the given child_id doesn't belong to
 *  the current household. Every parent route that accepts child_id must call
 *  this before mutating anything scoped to the child. */
export async function requireChildInHousehold(childId: string): Promise<{ childId: string; householdId: string }> {
  const householdId = await currentHouseholdId();
  const { data, error } = await admin()
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('household_id', householdId)
    .maybeSingle();
  if (error || !data) throw new Error(`child ${childId} not in current household`);
  return { childId, householdId };
}

/** First child in the current household — used as the default when a parent
 *  page hasn't specified an active child yet. Multi-child pages should take
 *  child_id as an explicit param. */
export async function firstChildIdInHousehold(): Promise<string | null> {
  const householdId = await currentHouseholdId();
  const { data } = await admin()
    .from('children')
    .select('id')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

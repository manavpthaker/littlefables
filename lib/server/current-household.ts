import { admin } from '@/lib/supabase/admin';
import { getParentSession } from './parent-session';

// Household resolution for the parent surface. Resolves from the parent
// OTP session — every parent belongs to exactly one household. When
// multi-child grandparent access is added later, this becomes a picker
// with a session-scoped selection.

/** Household id for the currently-authenticated parent. Throws if no
 *  parent session — every caller runs inside a guarded parent route
 *  (either middleware + layout, or requireParentSession() at the route
 *  boundary), so a missing session here is a programmer error. */
export async function currentHouseholdId(): Promise<string> {
  const session = await getParentSession();
  if (!session) {
    throw new Error('currentHouseholdId called without a parent session — call from inside a guarded parent route');
  }
  return session.householdId;
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

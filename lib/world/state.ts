import { admin } from '@/lib/supabase/admin';
import { worldStateSchema, type WorldStateData } from './types';

// Server helpers for world_states. Fails loud if the child row can't be found
// (invalid child_id) but auto-creates a fresh state on first read for a valid
// child — the row is expected by every kid-facing surface, so lazy creation
// keeps the client from having to bootstrap it.

const DEFAULT_STATE: WorldStateData = worldStateSchema.parse({});

export async function loadWorldState(childId: string): Promise<WorldStateData> {
  const { data } = await admin()
    .from('world_states')
    .select('data')
    .eq('child_id', childId)
    .maybeSingle();

  if (data?.data) {
    const parsed = worldStateSchema.safeParse(data.data);
    if (parsed.success) return parsed.data;
    // Malformed rows are treated as fresh — old shape gets migrated on next write.
  }

  // Auto-create.
  await admin()
    .from('world_states')
    .upsert({ child_id: childId, data: DEFAULT_STATE }, { onConflict: 'child_id' });

  return DEFAULT_STATE;
}

// Merge patch into the existing state. Numeric growth fields accept relative
// increments via updateGrowth (see below) rather than absolute writes — avoids
// races between two devices bumping the same counter.
export async function updateWorldState(
  childId: string,
  patch: Partial<WorldStateData>,
): Promise<WorldStateData> {
  const current = await loadWorldState(childId);
  const next: WorldStateData = worldStateSchema.parse({
    ...current,
    ...patch,
    growth: { ...current.growth, ...(patch.growth ?? {}) },
  });
  const { error } = await admin()
    .from('world_states')
    .upsert({ child_id: childId, data: next }, { onConflict: 'child_id' });
  if (error) throw new Error(`updateWorldState: ${error.message}`);
  return next;
}

// Add to a growth counter. Used by write endpoints that don't know the
// current value.
export async function bumpGrowth(
  childId: string,
  field: keyof WorldStateData['growth'],
  by = 1,
): Promise<void> {
  const current = await loadWorldState(childId);
  const nextGrowth = { ...current.growth, [field]: current.growth[field] + by };
  await updateWorldState(childId, { growth: nextGrowth });
}

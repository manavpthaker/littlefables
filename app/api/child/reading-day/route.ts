import { NextResponse } from 'next/server';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';
import { loadWorldState, updateWorldState } from '@/lib/world/state';
import { evaluateBadges, insertNewBadges } from '@/lib/world/badges';
import { todayIsoUtc } from '@/lib/world/dates';

// Mark today as a reading day. Idempotent (PK is (child_id, day)). Bumps the
// world's daysRead counter only when today's row is newly inserted so the
// counter reflects lifetime days, not repeated hits. Returns newlyEarned
// badges so the client can bloom them via CelebrationQueue.
export async function POST() {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const today = todayIsoUtc();

  // Check if today's row already exists — cheap way to know if the insert is
  // new without inspecting the upsert result.
  const { data: existing } = await admin()
    .from('reading_days')
    .select('day')
    .eq('child_id', ctx.childId)
    .eq('day', today)
    .maybeSingle();

  await admin()
    .from('reading_days')
    .upsert({ child_id: ctx.childId, day: today }, { onConflict: 'child_id,day', ignoreDuplicates: true });

  let newlyEarned: string[] = [];
  if (!existing) {
    // First time today. Bump lifetime days and evaluate badges.
    const world = await loadWorldState(ctx.childId);
    const nextWorld = await updateWorldState(ctx.childId, {
      growth: { ...world.growth, daysRead: world.growth.daysRead + 1 },
    });
    // Count this week's days to test streak badges.
    const { count } = await admin()
      .from('reading_days')
      .select('day', { head: true, count: 'exact' })
      .eq('child_id', ctx.childId);
    const qualified = evaluateBadges({
      world: nextWorld,
      readingDaysCount: count ?? 0,
      hasSavedWord: false,
      hasCorrectCheckpoint: false,
    });
    newlyEarned = await insertNewBadges(ctx.childId, qualified);
  }

  return NextResponse.json({ ok: true, day: today, newlyEarned });
}

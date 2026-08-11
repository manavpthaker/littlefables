'use server';

import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { getParentSession } from '@/lib/server/parent-session';

type IntakeStatus = 'awaiting' | 'new' | 'in_progress' | 'delivered' | 'archived';

const STATUSES: IntakeStatus[] = ['awaiting', 'new', 'in_progress', 'delivered', 'archived'];

async function guard() {
  const session = await getParentSession();
  if (!session) throw new Error('unauthorized');
}

export async function setIntakeStatus(id: string, status: string): Promise<void> {
  await guard();
  if (!STATUSES.includes(status as IntakeStatus)) {
    throw new Error(`unknown status: ${status}`);
  }
  const now = new Date().toISOString();
  const supa = admin();

  // Stamp delivered_at the first time a row reaches 'delivered'. It starts the
  // photo retention clock scripts/photo-purge.ts reads — `status` says where a
  // row is, never when it got there.
  //
  // Only stamped if it is still null, so flipping a row out of 'delivered' and
  // back (a re-publish, a correction) does not keep pushing the deletion date
  // out. Read-then-write rather than a filtered update: a filter that excluded
  // already-delivered rows would block the status change itself.
  let stampDelivered = false;
  if (status === 'delivered') {
    const { data: current } = await supa
      .from('intakes')
      .select('delivered_at')
      .eq('id', id)
      .maybeSingle();
    stampDelivered = !current?.delivered_at;
  }

  const { error } = await supa
    .from('intakes')
    .update({
      status,
      ...(stampDelivered ? { delivered_at: now } : {}),
      updated_at: now,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/parent/intakes');
}

export async function setIntakeNotes(id: string, notes: string): Promise<void> {
  await guard();
  const clean = notes.trim();
  const { error } = await admin()
    .from('intakes')
    .update({ notes: clean || null, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/parent/intakes');
}

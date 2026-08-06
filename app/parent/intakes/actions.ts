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
  const { error } = await admin()
    .from('intakes')
    .update({ status, updated_at: new Date().toISOString() })
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

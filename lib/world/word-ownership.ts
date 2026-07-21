import { admin } from '@/lib/supabase/admin';
import { stemOf } from '@/lib/reader/state';

// Word ownership (PRD B5): a saved word that shows up in the child's own
// spoken answer at a checkpoint/retell is understood — its star fills in
// (owned_at). Called fire-and-forget from answer routes; failures are
// swallowed (ownership is a bonus, never a blocker).

export async function markOwnershipFromTranscript(
  childId: string,
  transcript: string,
): Promise<string[]> {
  if (!transcript.trim()) return [];
  try {
    const { data: entries } = await admin()
      .from('wordbook_entries')
      .select('id, word, owned_at')
      .eq('child_id', childId)
      .is('owned_at', null);
    if (!entries?.length) return [];

    const spokenStems = new Set(
      transcript
        .split(/\s+/)
        .map((w) => stemOf(w))
        .filter(Boolean),
    );

    const nowIso = new Date().toISOString();
    const owned: string[] = [];
    for (const entry of entries) {
      if (!spokenStems.has(stemOf(entry.word))) continue;
      const { error } = await admin()
        .from('wordbook_entries')
        .update({ owned_at: nowIso, last_encounter_at: nowIso })
        .eq('id', entry.id);
      if (!error) owned.push(entry.word);
    }
    return owned;
  } catch {
    return [];
  }
}

import { admin } from '@/lib/supabase/admin';
import type { Json } from '@/types/database';
import type { QAResult } from './pipeline';

// Persist QA outcome to qa_records (audit S2 fix — server-persisted, not
// fire-and-forget from client). One row per (book_id, attempt).
export async function persistQA(input: {
  bookId: string;
  householdId: string;
  attempt: number;
  result: QAResult;
}): Promise<void> {
  const { error } = await admin()
    .from('qa_records')
    .upsert(
      {
        book_id: input.bookId,
        household_id: input.householdId,
        attempt: input.attempt,
        status: input.result.status,
        stage0: input.result.stage0 as unknown as Json,
        hard_gates: (input.result.hardGates ?? null) as unknown as Json,
        soft_score: (input.result.softScore ?? null) as unknown as Json,
        canon_version: input.result.canonVersion,
        model: input.result.model,
      },
      { onConflict: 'book_id,attempt' },
    );
  if (error) console.warn('[qa/persist] failed:', error.message);
}

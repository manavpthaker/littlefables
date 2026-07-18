import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { admin } from '@/lib/supabase/admin';
import { SEED_HOUSEHOLD_ID } from '@/lib/models/seed';
import { CHILD_BANDS } from '@/lib/models/child';

// Parent-side: add a child to the current household.
const bodySchema = z.object({
  displayName: z.string().min(1).max(40),
  band: z.enum(CHILD_BANDS).default('4-8'),
  excludeTerms: z.array(z.string().max(60)).max(20).default([]),
  pronouns: z.string().max(30).optional(),
});

export async function POST(request: NextRequest) {
  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data, error } = await admin()
    .from('children')
    .insert({
      household_id: SEED_HOUSEHOLD_ID,
      display_name: body.data.displayName,
      band: body.data.band,
      exclude_terms: body.data.excludeTerms,
      pronouns: body.data.pronouns ?? null,
    })
    .select('id')
    .single();
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'db_failed' }, { status: 500 });

  return NextResponse.json({ ok: true, childId: data.id });
}

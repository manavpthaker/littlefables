import { NextResponse, type NextRequest } from 'next/server';
import { requireParentSession } from '@/lib/server/parent-session';
import { admin } from '@/lib/supabase/admin';
import {
  childSettingsSchema,
  parseChildSettings,
  updateSettingsBodySchema,
} from '@/lib/models/settings';
import type { Json } from '@/types/database';

// Parent Settings — GET rosters children with their parsed settings; PUT
// partial-merges a child's settings and optional band, revalidates the
// merged object. Household-scoped to the authenticated parent.

export async function GET(request: NextRequest) {
  const session = await requireParentSession(request);
  if (session instanceof NextResponse) return session;
  const householdId = session.householdId;

  const { data: children, error } = await admin()
    .from('children')
    .select('id, display_name, band, settings')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    children: (children ?? []).map((c) => ({
      childId: c.id,
      displayName: c.display_name,
      band: c.band,
      settings: parseChildSettings(c.settings),
    })),
  });
}

export async function PUT(request: NextRequest) {
  const session = await requireParentSession(request);
  if (session instanceof NextResponse) return session;
  const householdId = session.householdId;

  const body = updateSettingsBodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const { childId, settings: patch, band } = body.data;

  const { data: child } = await admin()
    .from('children')
    .select('id, settings')
    .eq('id', childId)
    .eq('household_id', householdId)
    .maybeSingle();
  if (!child) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const merged = childSettingsSchema.safeParse({
    ...parseChildSettings(child.settings),
    ...patch,
  });
  if (!merged.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const update: { settings: Json; band?: string } = {
    settings: merged.data as unknown as Json,
  };
  if (band) update.band = band;

  const { error } = await admin().from('children').update(update).eq('id', childId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, settings: merged.data });
}

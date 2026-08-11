import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Buyer-controlled photo retention.
//
// Authenticated by the per-order token alone, same as the intake form itself.
// That is deliberate: requiring an account to delete your child's photograph
// would put a login between a parent and a privacy control, and the token is
// already the credential we chose for this buyer.
//
// 'delete' deletes now rather than marking for a sweep. A buyer who clicks
// delete has decided; leaving the file sitting there until a cron runs means
// the honest version of the confirmation message is "we will get to it", which
// is not what anyone wants to read on this page. scripts/photo-purge.ts still
// exists as the backstop for rows nobody ever answers.

export async function POST(req: Request) {
  let body: { token?: unknown; choice?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'expected JSON' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const choice = body.choice;
  if (!token) {
    return NextResponse.json({ error: 'missing token' }, { status: 400 });
  }
  if (choice !== 'keep' && choice !== 'delete') {
    return NextResponse.json({ error: 'choice must be "keep" or "delete"' }, { status: 400 });
  }

  const supa = admin();
  const { data: row, error: readErr } = await supa
    .from('intakes')
    .select('id, photo_path, photo_deleted_at')
    .eq('token', token)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ error: 'could not read that order' }, { status: 500 });
  }
  if (!row) {
    // Same response shape as a valid token so this endpoint can't be used to
    // probe which tokens exist.
    return NextResponse.json({ ok: true, choice });
  }

  const now = new Date().toISOString();

  if (choice === 'keep') {
    await supa
      .from('intakes')
      .update({ photo_retention: 'keep', photo_choice_at: now, updated_at: now })
      .eq('id', row.id);
    return NextResponse.json({ ok: true, choice });
  }

  // Delete: storage object first, then the row flags. In that order, because a
  // crash between the two leaves a row that still says "has a photo" pointing
  // at a file that's gone — recoverable and harmless. The reverse leaves a row
  // claiming deletion over a file that still exists, which is a lie in a
  // privacy record.
  if (row.photo_path && !row.photo_deleted_at) {
    const { error: rmErr } = await supa.storage.from('intake-uploads').remove([row.photo_path]);
    if (rmErr) {
      return NextResponse.json({ error: `could not delete the photo: ${rmErr.message}` }, { status: 500 });
    }
  }

  await supa
    .from('intakes')
    .update({
      photo_retention: 'delete',
      photo_choice_at: now,
      photo_deleted_at: now,
      updated_at: now,
    })
    .eq('id', row.id);

  return NextResponse.json({ ok: true, choice });
}

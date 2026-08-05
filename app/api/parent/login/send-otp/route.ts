import { NextResponse, type NextRequest } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { publicAuth } from '@/lib/supabase/public';

// Send an email OTP to a pre-provisioned parent email.
//
// Invite-only: rejects any email that isn't in parents.email. Prevents
// arbitrary email addresses from receiving OTP mail (and thus prevents
// Supabase Auth from filling up with accounts we didn't provision).
//
// First-time linkage: if the parent row exists but has never authed
// (auth_user_id is null), we create the matching Supabase Auth user
// on the fly with email_confirm=true — OTP receipt itself proves email
// ownership, no separate confirm step needed.

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const emailRaw = body?.email;
  if (typeof emailRaw !== 'string' || !emailRaw.trim()) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }
  const email = emailRaw.trim().toLowerCase();

  const { data: parent } = await admin()
    .from('parents')
    .select('id, email, auth_user_id')
    .ilike('email', email)
    .maybeSingle();

  if (!parent) {
    // Do not disclose whether an email is provisioned. Same shape as
    // success — the front end will show "check your email" either way.
    // Rate-limiting relies on Supabase Auth's built-in per-email throttle
    // for the send path, which we never call for unknown emails.
    return NextResponse.json({ ok: true });
  }

  // First auth for this parent — create the Supabase Auth user and link.
  if (!parent.auth_user_id) {
    const { data: created, error: createErr } = await admin().auth.admin.createUser({
      email: parent.email,
      email_confirm: true,
    });
    if (createErr || !created?.user) {
      return NextResponse.json({ error: 'could not initialize account' }, { status: 500 });
    }
    const { error: linkErr } = await admin()
      .from('parents')
      .update({ auth_user_id: created.user.id })
      .eq('id', parent.id);
    if (linkErr) {
      return NextResponse.json({ error: 'could not link account' }, { status: 500 });
    }
  }

  const { error: otpErr } = await publicAuth().auth.signInWithOtp({
    email: parent.email,
    options: { shouldCreateUser: false },
  });
  if (otpErr) {
    return NextResponse.json({ error: 'could not send code' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

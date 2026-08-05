import { NextResponse, type NextRequest } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { sendOtpEmail } from '@/lib/server/resend-mailer';

// Send an email OTP to a pre-provisioned parent email.
//
// Invite-only: rejects any email that isn't in parents.email. Prevents
// arbitrary email addresses from receiving OTP mail (and thus prevents
// Supabase Auth from filling up with accounts we didn't provision).
//
// Delivery bypass: we generate the OTP via admin.auth.admin.generateLink()
// (which returns the 6-digit code WITHOUT sending an email) and deliver
// it ourselves via Resend. Supabase's built-in / custom-SMTP relay is not
// involved. Reasons:
//   - Supabase's SMTP integration silently drops emails when the sender
//     domain isn't fully verified or when a hidden per-hour cap is hit.
//   - Sending ourselves means observable deliverability (Resend dashboard),
//     a branded template, and no dashboard config to babysit.
// verifyOtp still runs through Supabase Auth — the token is a real
// Supabase-issued OTP, so /api/parent/login/verify-otp is unchanged.
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
    return NextResponse.json({ ok: true });
  }

  // First auth for this parent — create the Supabase Auth user and link.
  if (!parent.auth_user_id) {
    const { data: created, error: createErr } = await admin().auth.admin.createUser({
      email: parent.email,
      email_confirm: true,
    });
    if (createErr || !created?.user) {
      console.error('[send-otp] createUser failed:', createErr?.message);
      return NextResponse.json({ error: 'could not initialize account' }, { status: 500 });
    }
    const { error: linkErr } = await admin()
      .from('parents')
      .update({ auth_user_id: created.user.id })
      .eq('id', parent.id);
    if (linkErr) {
      console.error('[send-otp] parent link failed:', linkErr.message);
      return NextResponse.json({ error: 'could not link account' }, { status: 500 });
    }
  }

  // Generate a magiclink-style OTP without asking Supabase to send.
  // Returns both the 6-digit code AND a hashed token we use to build
  // our own magic-link URL (see /api/parent/login/magic).
  const { data: linkData, error: linkErr } = await admin().auth.admin.generateLink({
    type: 'magiclink',
    email: parent.email,
  });
  const otp = linkData?.properties?.email_otp;
  const tokenHash = linkData?.properties?.hashed_token;
  if (linkErr || !otp || !tokenHash) {
    console.error('[send-otp] generateLink failed:', linkErr?.message);
    return NextResponse.json({ error: 'could not issue code' }, { status: 500 });
  }

  // Build the sign-in URL against the incoming request's origin so it
  // works in dev (localhost:3000) and prod (littlefables.app) without an
  // env var. Callback exchanges the token for our session cookies.
  const signInUrl = new URL('/api/parent/login/magic', request.url);
  signInUrl.searchParams.set('token_hash', tokenHash);

  try {
    await sendOtpEmail({
      to: parent.email,
      code: otp,
      signInUrl: signInUrl.toString(),
    });
  } catch (err) {
    // A Resend outage is the only realistic path to this branch. Surface
    // a real error so the login form can tell the parent to try again.
    console.error('[send-otp] resend send failed:', (err as Error).message);
    return NextResponse.json({ error: 'could not send code' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

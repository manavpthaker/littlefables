import { NextResponse, type NextRequest } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { publicAuth } from '@/lib/supabase/public';
import { setParentSessionCookies } from '@/lib/server/parent-session';

// Verify a 6-digit OTP and sign the parent in.
//
// Success path: sets access + refresh cookies from the returned Supabase
// session. Client-side redirects to /parent.
//
// Belt-and-suspenders: we re-check that the verified user maps to a
// parents row before setting cookies. Prevents an OTP that somehow
// authenticated a stray Supabase Auth user (created outside our
// provisioning flow) from getting parent-surface access.

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; token?: string }
    | null;
  const emailRaw = body?.email;
  const token = body?.token;

  if (typeof emailRaw !== 'string' || !emailRaw.trim()) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }
  if (typeof token !== 'string' || !/^\d{6}$/.test(token)) {
    return NextResponse.json({ error: 'six-digit code required' }, { status: 400 });
  }
  const email = emailRaw.trim().toLowerCase();

  const { data, error } = await publicAuth().auth.verifyOtp({ email, token, type: 'email' });
  if (error || !data.session || !data.user?.email) {
    return NextResponse.json({ error: 'code did not verify' }, { status: 401 });
  }

  const { data: parent } = await admin()
    .from('parents')
    .select('id')
    .eq('auth_user_id', data.user.id)
    .maybeSingle();

  if (!parent) {
    // Verified auth user has no household. Sign them right back out and
    // decline. Should be unreachable — send-otp only sends to provisioned
    // emails and links auth_user_id on the way.
    return NextResponse.json({ error: 'no household for this account' }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true, redirect: '/parent' });
  setParentSessionCookies(response, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in ?? null,
  });
  return response;
}

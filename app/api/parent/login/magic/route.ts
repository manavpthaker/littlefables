import { NextResponse, type NextRequest } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { publicAuth } from '@/lib/supabase/public';
import { setParentSessionCookies } from '@/lib/server/parent-session';

// Magic-link callback. The OTP email carries both a 6-digit code AND a
// "Sign in" button that lands here — tapping the button skips the paste
// step entirely.
//
// Flow:
//   1. Read token_hash from the query (generated alongside the OTP in
//      send-otp via admin.generateLink()).
//   2. Exchange it for a real Supabase Auth session via verifyOtp with
//      type=magiclink. Same JWT the paste-the-code flow ends up with.
//   3. Re-check the user is linked to a parents row (belt-and-suspenders,
//      matches the verify-otp route's posture).
//   4. Set our parent-session cookies and redirect to /parent.
//
// Failure modes all funnel through /login?error=<slug> so the parent gets
// something to try again from instead of a bare 400.

function fail(request: NextRequest, slug: string): NextResponse {
  const url = new URL('/login', request.url);
  url.searchParams.set('error', slug);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  if (!tokenHash) return fail(request, 'missing_token');

  const { data, error } = await publicAuth().auth.verifyOtp({
    token_hash: tokenHash,
    type: 'magiclink',
  });
  if (error || !data.session || !data.user?.id) {
    console.error('[magic] verifyOtp failed:', error?.message);
    return fail(request, 'invalid_or_expired');
  }

  const { data: parent } = await admin()
    .from('parents')
    .select('id')
    .eq('auth_user_id', data.user.id)
    .maybeSingle();
  if (!parent) return fail(request, 'no_household');

  const response = NextResponse.redirect(new URL('/parent', request.url));
  setParentSessionCookies(response, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in ?? null,
  });
  return response;
}

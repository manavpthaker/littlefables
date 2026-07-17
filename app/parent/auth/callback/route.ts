import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { admin } from '@/lib/supabase/admin';

// Supabase OTP redirect handler. On first successful sign-in, provisions a
// `parents` row bound to the auth user, attached to the seeded household.
// Phase 5 will replace the auto-attach with a real household-picker / invite flow.
const SEED_HOUSEHOLD_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/parent';

  if (!code) return NextResponse.redirect(`${origin}/parent/auth/login?error=missing_code`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/parent/auth/login?error=${encodeURIComponent(error.message)}`);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    // Upsert the parent record. auth_user_id is unique so this is idempotent.
    await admin()
      .from('parents')
      .upsert(
        {
          household_id: SEED_HOUSEHOLD_ID,
          auth_user_id: user.id,
          email: user.email,
        },
        { onConflict: 'auth_user_id' },
      );
  }

  return NextResponse.redirect(`${origin}${next}`);
}

import { type NextRequest } from 'next/server';
import { signInWithChildToken } from '@/lib/auth/sign-in-with-child-token';

// Legacy magic-URL handler. Kept working for any tokens already handed
// out in the /f/<token> form; new provisioning emits /read/<slug>/<token>
// via scripts/new-household.ts. See docs/commerce/delivery-flow.md.

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  return signInWithChildToken(request, token);
}

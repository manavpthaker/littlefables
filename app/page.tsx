import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CHILD_TOKEN_COOKIE } from '@/lib/auth/child-token';

// Entry decision: child-device token present → the kid shelf. Otherwise, Parent Corner.
// The token is only trusted at the actual API/route boundaries; this is a UX hint.
export default async function RootPage() {
  const store = await cookies();
  const hasChildToken = Boolean(store.get(CHILD_TOKEN_COOKIE)?.value);
  redirect(hasChildToken ? '/read' : '/parent');
}

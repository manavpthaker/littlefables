import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { admin } from '@/lib/supabase/admin';
import { bookSchema } from '@/lib/models/book';
import { toReaderBook } from '@/lib/reader/state';
import { bumpShareViewCount, loadShare } from '@/lib/server/book-shares';
import { SharePasswordGate } from './password-gate';
import { ShareReader } from './share-reader';

// Public share view. No household auth. The token IS the auth. If the
// share carries a password, we prompt for it before rendering the reader.
// Once unlocked, a share-scoped cookie persists for a week so page turns
// don't re-prompt.

const COOKIE_PREFIX = 'lf_share_';
const KID_VISIBLE_STATUSES = ['complete', 'published'];

export const dynamic = 'force-dynamic';

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = await loadShare(token);
  if (!share) notFound();

  // Password-gated? Check the unlock cookie; prompt if not set.
  if (share.requiresPassword) {
    const jar = await cookies();
    const unlocked = jar.get(`${COOKIE_PREFIX}${share.shareId}`)?.value === '1';
    if (!unlocked) {
      return <SharePasswordGate token={token} />;
    }
  }

  const { data } = await admin()
    .from('books')
    .select('id, title, book, status, cover_bg')
    .eq('id', share.bookId)
    .eq('household_id', share.householdId)
    .in('status', KID_VISIBLE_STATUSES)
    .maybeSingle();

  if (!data?.book) notFound();

  const parsed = bookSchema.safeParse(data.book);
  if (!parsed.success) notFound();

  if (!parsed.data.coverImage && data.cover_bg?.startsWith('http')) {
    parsed.data.coverImage = data.cover_bg;
  }

  const readerBook = toReaderBook(parsed.data);

  // Fire-and-forget analytics; do not block render.
  void bumpShareViewCount(share.shareId);

  return <ShareReader book={readerBook} />;
}

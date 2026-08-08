import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { admin } from '@/lib/supabase/admin';
import { bookSchema } from '@/lib/models/book';
import { toReaderBook } from '@/lib/reader/state';
import { bumpShareViewCount, loadShare } from '@/lib/server/book-shares';
import { SharePasswordGate } from './password-gate';
import { ShareReader } from './share-reader';
import { SharedLibrary, type SharedShelfBook } from './shared-library';

// Public share view. No household auth. The token IS the auth. If the
// share carries a password, we prompt for it before rendering the reader.
// Once unlocked, a share-scoped cookie persists for a week so page turns
// don't re-prompt.
//
// Two share shapes: book_id set → straight into that book's reader;
// book_id null → the household's whole shelf, where ?book=<id> opens one
// of its books and "Choose another story" leads back to the shelf.

const COOKIE_PREFIX = 'lf_share_';
const KID_VISIBLE_STATUSES = ['complete', 'published'];

export const dynamic = 'force-dynamic';

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ book?: string }>;
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

  // Fire-and-forget analytics; do not block render.
  void bumpShareViewCount(share.shareId);

  // Library share: render the shared shelf, or the picked book from it.
  if (share.bookId === null) {
    const { book: pickedId } = await searchParams;
    if (pickedId) {
      const readerBook = await loadShareBook(pickedId, share.householdId);
      if (!readerBook) notFound();
      return <ShareReader book={readerBook} libraryHref={`/share/${token}`} />;
    }

    const { data } = await admin()
      .from('books')
      .select('id, title, book, status, cover_bg')
      .eq('household_id', share.householdId)
      .eq('shelf_enabled', true)
      .in('status', KID_VISIBLE_STATUSES);

    const shelf: SharedShelfBook[] = (data ?? []).flatMap((row) => {
      const parsed = bookSchema.safeParse(row.book);
      if (!parsed.success) return [];
      const coverImage =
        parsed.data.coverImage ??
        (row.cover_bg?.startsWith('http') ? row.cover_bg : undefined);
      return [{ id: row.id, title: parsed.data.title, coverImage, coverBg: row.cover_bg }];
    });
    if (shelf.length === 0) notFound();

    return <SharedLibrary token={token} books={shelf} />;
  }

  const readerBook = await loadShareBook(share.bookId, share.householdId);
  if (!readerBook) notFound();

  return <ShareReader book={readerBook} />;
}

async function loadShareBook(bookId: string, householdId: string) {
  const { data } = await admin()
    .from('books')
    .select('id, title, book, status, cover_bg')
    .eq('id', bookId)
    .eq('household_id', householdId)
    .in('status', KID_VISIBLE_STATUSES)
    .maybeSingle();

  if (!data?.book) return null;

  const parsed = bookSchema.safeParse(data.book);
  if (!parsed.success) return null;

  if (!parsed.data.coverImage && data.cover_bg?.startsWith('http')) {
    parsed.data.coverImage = data.cover_bg;
  }

  return toReaderBook(parsed.data);
}

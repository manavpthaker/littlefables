import { cache } from 'react';
import type { Metadata } from 'next';
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
//
// generateMetadata gives the link its own title and cover art, so a share
// pasted into Messages previews as the actual book rather than as the site.
// The loaders below are cache()d because metadata and the page render in
// the same request and would otherwise each hit the database.

const COOKIE_PREFIX = 'lf_share_';
const KID_VISIBLE_STATUSES = ['complete', 'published'];

export const dynamic = 'force-dynamic';

const getShare = cache(async (token: string) => loadShare(token));

const getBookRow = cache(async (bookId: string, householdId: string) => {
  const { data } = await admin()
    .from('books')
    .select('id, title, book, status, cover_bg')
    .eq('id', bookId)
    .eq('household_id', householdId)
    .in('status', KID_VISIBLE_STATUSES)
    .maybeSingle();
  return data ?? null;
});

const getShelfRows = cache(async (householdId: string) => {
  const { data } = await admin()
    .from('books')
    .select('id, title, book, status, cover_bg')
    .eq('household_id', householdId)
    .eq('shelf_enabled', true)
    .in('status', KID_VISIBLE_STATUSES);
  return data ?? [];
});

/** Cover art for a book row, absolute so it survives being pasted into a
 *  messaging app. Falls back to the first illustrated page. */
function coverOf(row: { book: unknown; cover_bg: string | null }): string | undefined {
  const parsed = bookSchema.safeParse(row.book);
  if (!parsed.success) return undefined;
  if (parsed.data.coverImage) return parsed.data.coverImage;
  if (row.cover_bg?.startsWith('http')) return row.cover_bg;
  for (const c of parsed.data.chapters) {
    for (const p of c.pages) {
      const img = (p as { img?: string }).img;
      if (img?.startsWith('http')) return img;
    }
  }
  return undefined;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ book?: string }>;
}): Promise<Metadata> {
  // Share links are private by design — keep them out of search results
  // regardless of which branch below produces the title.
  const base: Metadata = { robots: { index: false, follow: false } };

  // Dead or revoked links render the not-found page, but note they answer
  // 200, not 404: this route streams, so the status is committed before
  // either this function or the body can call notFound(). Measured, not
  // assumed — moving the call here doesn't change it. Harmless today (the
  // page leaks nothing and every share is noindex) but it is a soft 404.
  const { token } = await params;
  const share = await getShare(token);
  if (!share) notFound();

  // A password-gated link previews before anyone types the password, so the
  // preview must not reveal what's behind it.
  if (share.requiresPassword) {
    return {
      ...base,
      title: 'A story is waiting for you',
      description: 'Someone shared a Little Fables storybook with you. The link asks for a password.',
    };
  }

  const describe = (title: string, description: string, image?: string): Metadata => ({
    ...base,
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Little Fables',
      ...(image ? { images: [{ url: image, width: 1254, height: 1254, alt: title }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  });

  const bookId = share.bookId ?? (await searchParams).book ?? null;
  if (bookId) {
    const row = await getBookRow(bookId, share.householdId);
    if (!row) notFound();
    return describe(row.title, 'A storybook from Little Fables, shared with you.', coverOf(row));
  }

  const shelf = await getShelfRows(share.householdId);
  const count = shelf.length;
  return describe(
    'A shelf, shared with you',
    count === 1
      ? 'One storybook from Little Fables.'
      : `${count} storybooks from Little Fables.`,
    shelf.map(coverOf).find(Boolean),
  );
}

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ book?: string }>;
}) {
  const { token } = await params;
  const share = await getShare(token);
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

    const shelf: SharedShelfBook[] = (await getShelfRows(share.householdId)).flatMap((row) => {
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
  const data = await getBookRow(bookId, householdId);
  if (!data?.book) return null;

  const parsed = bookSchema.safeParse(data.book);
  if (!parsed.success) return null;

  if (!parsed.data.coverImage && data.cover_bg?.startsWith('http')) {
    parsed.data.coverImage = data.cover_bg;
  }

  return toReaderBook(parsed.data);
}

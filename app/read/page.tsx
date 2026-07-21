import Link from 'next/link';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { requireChildDevice } from '@/lib/server/require-auth';
import { isoToWeekIdx, streakLength, todayIsoUtc, weekWindowUtc } from '@/lib/world/dates';
import { loadWorldState } from '@/lib/world/state';
import { loadEarnedBadges } from '@/lib/world/badges';
import { activeBuddy } from '@/lib/world/buddy-roster';
import { composeGreeting } from '@/lib/world/greeting';
import type { WorldBundle } from '@/lib/world/types';
import { deriveLayerTag, type LayerTag } from '@/lib/models/layer-tags';
import { deriveInteractivity } from '@/lib/models/book';
import { pickGreetingWord } from '@/lib/world/word-scheduler';
import { HomeWordJar } from './word-jar';
import { StreakCard } from './streak-card';
import { ShelfGrid, type ShelfBook } from './shelf-grid';
import { ContinueBanner, type ContinueTarget } from './continue-banner';
import { HomeBuddy } from './home-buddy';
import { BadgeStrip } from './badge-strip';

// Kid Home. Composition matters: warm paper background, prominent Buddy with
// spoken greeting, SunsRow ribbon, ContinueCard if any progress, then the
// shelf. Uses design-system tokens (--space-*, --radius-*, --font-*, pigments).
const KID_VISIBLE_STATUSES = ['complete', 'published', 'awaiting-choice'];

export default async function ReadHome() {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) redirect('/parent');

  const week = weekWindowUtc();
  const [
    { data: childRow },
    { data: bookRows },
    { data: progressRows },
    { data: readingDayRows },
    { data: recentWordsRows, count: wordCount },
    { data: recentProgressRows },
    world,
    badges,
  ] = await Promise.all([
    admin().from('children').select('display_name').eq('id', ctx.childId).maybeSingle(),
    admin()
      .from('books')
      .select('id, title, kind, source, status, cover_emoji, cover_bg, book, origin_note')
      .eq('household_id', ctx.householdId)
      .in('status', KID_VISIBLE_STATUSES)
      .eq('shelf_enabled', true)
      .order('title'),
    admin()
      .from('book_progress')
      .select('book_id, chapter_idx, page_idx, updated_at')
      .eq('child_id', ctx.childId)
      .order('updated_at', { ascending: false }),
    admin()
      .from('reading_days')
      .select('day')
      .eq('child_id', ctx.childId)
      .in('day', week),
    admin()
      .from('wordbook_entries')
      .select('word, saved_at, owned_at, last_encounter_at, encounter_count', { count: 'exact' })
      .eq('child_id', ctx.childId)
      .order('saved_at', { ascending: false })
      .limit(30),
    admin()
      .from('book_progress')
      .select('book_id, books!inner(id, title)')
      .eq('child_id', ctx.childId)
      .order('updated_at', { ascending: false })
      .limit(3),
    loadWorldState(ctx.childId),
    loadEarnedBadges(ctx.childId),
  ]);

  const today = todayIsoUtc();
  const todayIdx = isoToWeekIdx(today);
  const earnedIdx = (readingDayRows ?? [])
    .map((r) => week.indexOf(r.day))
    .filter((i) => i >= 0);
  const readingDays = (readingDayRows ?? []).map((r) => r.day);

  const buddy = activeBuddy(world.activeBuddyId);
  const bundle: WorldBundle = {
    world,
    readingDays,
    todayEarned: readingDays.includes(today),
    todayIdx,
    badges,
    recentWords: (recentWordsRows ?? []).slice(0, 5).map((r) => ({ word: r.word, savedAt: r.saved_at })),
    dueWord: pickGreetingWord(
      (recentWordsRows ?? []).map((r) => ({
        word: r.word,
        savedAt: r.saved_at,
        ownedAt: r.owned_at,
        lastEncounterAt: r.last_encounter_at,
        encounterCount: r.encounter_count ?? 0,
      })),
      new Date(),
    ),
    recentBooks: ((recentProgressRows ?? []) as Array<{
      book_id: string;
      books: { id: string; title: string } | { id: string; title: string }[] | null;
    }>).map((r) => {
      const book = Array.isArray(r.books) ? r.books[0] : r.books;
      return { id: book?.id ?? r.book_id, title: book?.title ?? '' };
    }),
  };
  const greeting = composeGreeting(bundle, buddy);

  // Progress per book — used both by ShelfGrid (per-card ribbon) and by the
  // ContinueBanner (most-recent).
  const progressByBook = new Map<string, { chapterIdx: number; pageIdx: number }>();
  for (const p of progressRows ?? []) {
    if (!progressByBook.has(p.book_id)) {
      progressByBook.set(p.book_id, { chapterIdx: p.chapter_idx, pageIdx: p.page_idx });
    }
  }

  const books: ShelfBook[] = (bookRows ?? []).map((b) => {
    const p = progressByBook.get(b.id);
    return {
      id: b.id,
      title: b.title,
      kind: b.kind as 'quick' | 'chapter',
      coverEmoji: b.cover_emoji,
      coverBg: b.cover_bg,
      coverImage: b.cover_bg?.startsWith('http') ? b.cover_bg : null,
      status: b.status,
      layerTag: layerTagOf(b),
      interactivity: deriveInteractivity(b.book),
      progress: p ? progressFraction(b, p.chapterIdx, p.pageIdx) : 0,
    };
  });

  const latestProgress = progressRows?.[0];
  const targetBook = latestProgress
    ? (bookRows ?? []).find((b) => b.id === latestProgress.book_id)
    : null;
  const continueTarget: ContinueTarget | null =
    latestProgress && targetBook
      ? {
          id: targetBook.id,
          title: targetBook.title,
          chapterCaption: chapterCaption(targetBook, latestProgress.chapter_idx),
          cover: targetBook.cover_bg?.startsWith('http') ? targetBook.cover_bg : undefined,
          progress: progressFraction(targetBook, latestProgress.chapter_idx, latestProgress.page_idx),
        }
      : null;

  // Group the shelf: continue-in-flight first (excluded from grid), then rest.
  const restBooks = continueTarget
    ? books.filter((b) => b.id !== continueTarget.id)
    : books;

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'var(--surface-page)',
      }}
    >
      <div
        className="lf-frame"
        style={{
          paddingTop: 'var(--space-6)',
          paddingBottom: 'var(--space-4)',
          display: 'grid',
          gap: 'var(--space-5)',
        }}
      >
        <HomeBuddy buddy={buddy} utterance={greeting.utterance} childName={childRow?.display_name} />

        <StreakCard earned={earnedIdx} today={todayIdx} streak={streakLength(readingDays)} />

        {continueTarget && <ContinueBanner target={continueTarget} />}

        <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                margin: 0,
                fontSize: 'var(--text-title)',
                lineHeight: 'var(--lh-title)',
                color: 'var(--text-strong)',
              }}
            >
              {childRow?.display_name ? `${childRow.display_name}'s shelf` : 'Your shelf'}
            </h2>
            <Link
              href="/read/library"
              style={{
                fontFamily: 'var(--font-hand)',
                fontSize: 'var(--text-hand)',
                color: 'var(--marigold)',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              See all →
            </Link>
          </div>
          <ShelfGrid books={restBooks} variant="row" />
        </section>

        <HomeWordJar
          words={(recentWordsRows ?? []).slice(0, 5).map((r) => ({ word: r.word, owned: Boolean(r.owned_at) }))}
          count={wordCount ?? 0}
        />

        <BadgeStrip earned={badges} />
      </div>
    </main>
  );
}

function layerTagOf(b: { book: unknown; origin_note: string | null }): LayerTag {
  const payload = b.book as { layerTag?: LayerTag; teachingGoals?: string[] } | null;
  if (payload?.layerTag) return payload.layerTag;
  return deriveLayerTag(payload?.teachingGoals ?? [], b.origin_note);
}

function progressFraction(
  book: { book: unknown },
  chapterIdx: number,
  pageIdx: number,
): number {
  const chapters = (book.book as { chapters?: { pages?: unknown[] }[] })?.chapters ?? [];
  let seen = 0;
  let total = 0;
  chapters.forEach((c, i) => {
    const n = c.pages?.length ?? 0;
    total += n;
    if (i < chapterIdx) seen += n;
    else if (i === chapterIdx) seen += Math.min(pageIdx + 1, n);
  });
  return total > 0 ? Math.min(1, seen / total) : 0;
}

function chapterCaption(
  book: { book: unknown; kind: string },
  chapterIdx: number,
): string | undefined {
  if (book.kind !== 'chapter') return undefined;
  const chapters = (book.book as { chapters?: { title?: string }[] })?.chapters ?? [];
  const title = chapters[chapterIdx]?.title;
  return title ? `Chapter ${chapterIdx + 1} · ${title}` : undefined;
}

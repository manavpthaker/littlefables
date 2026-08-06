import type { Metadata } from 'next';
import Link from 'next/link';
import { admin } from '@/lib/supabase/admin';
import { IntakeRow } from './intake-row';

export const metadata: Metadata = { title: 'Orders · Little Fables' };
export const dynamic = 'force-dynamic';

// Fulfillment inbox for buyer intakes from /intake.
//
// The parent layout has already enforced OTP auth by the time we render;
// this page just reads with the service role, mints short-lived signed
// URLs for the private photo bucket, and hands each row to the client
// component for inline status + notes editing.

type Status = 'awaiting' | 'new' | 'in_progress' | 'delivered' | 'archived';
const STATUSES: Status[] = ['awaiting', 'new', 'in_progress', 'delivered', 'archived'];

export default async function IntakesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus: Status = STATUSES.includes(status as Status) ? (status as Status) : 'new';

  const supa = admin();
  const { data: rows, error } = await supa
    .from('intakes')
    .select('*')
    .eq('status', activeStatus)
    .order('created_at', { ascending: false });

  const counts = await Promise.all(
    STATUSES.map(async (s) => {
      const { count } = await supa
        .from('intakes')
        .select('id', { count: 'exact', head: true })
        .eq('status', s);
      return [s, count ?? 0] as const;
    }),
  );

  const withPhotos = await Promise.all(
    (rows ?? []).map(async (r) => {
      let photoUrl: string | null = null;
      if (r.photo_path) {
        const signed = await supa.storage
          .from('intake-uploads')
          .createSignedUrl(r.photo_path, 60 * 60);
        photoUrl = signed.data?.signedUrl ?? null;
      }
      return { row: r, photoUrl };
    }),
  );

  return (
    <main style={{ display: 'grid', gap: 'var(--space-5)' }}>
      <header style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: 0, color: 'var(--ink)' }}>
          Orders
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 14 }}>
          Every buyer intake lands here. Change status as you move each book through the pipeline.
        </p>
      </header>

      <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {counts.map(([s, count]) => {
          const label = s === 'in_progress'
            ? 'In progress'
            : s === 'awaiting'
              ? 'Awaiting buyer'
              : s.charAt(0).toUpperCase() + s.slice(1);
          const isActive = s === activeStatus;
          return (
            <Link
              key={s}
              href={`/parent/intakes?status=${s}`}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--pill-edge)',
                background: isActive ? 'var(--oxblood-wash)' : 'transparent',
                color: isActive ? 'var(--oxblood-text)' : 'var(--ink-soft)',
                fontSize: 14,
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
              }}
            >
              {label} <span style={{ opacity: 0.6 }}>({count})</span>
            </Link>
          );
        })}
      </nav>

      {error && (
        <div
          role="alert"
          style={{
            padding: 12,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--oxblood)',
            background: 'var(--oxblood-wash)',
            color: 'var(--oxblood-text)',
            fontSize: 14,
          }}
        >
          Could not load intakes: {error.message}
        </div>
      )}

      {withPhotos.length === 0 && !error && (
        <div style={{ color: 'var(--ink-faint)', fontSize: 14, padding: 'var(--space-4)' }}>
          Nothing here yet. When a buyer submits{' '}
          <Link href="/intake" style={{ color: 'var(--oxblood)' }}>the intake form</Link>, it will
          show up in the <strong>New</strong> tab.
        </div>
      )}

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {withPhotos.map(({ row, photoUrl }) => (
          <IntakeRow
            key={row.id}
            id={row.id}
            status={row.status as Status}
            buyerEmail={row.buyer_email}
            childName={row.child_name}
            ageBand={row.age_band}
            ageYears={row.age_years != null ? Number(row.age_years) : null}
            interests={row.interests ?? []}
            interestsNote={row.interests_note}
            traits={row.traits ?? []}
            traitsNote={row.traits_note}
            inspirations={row.inspirations}
            look={row.look}
            giftFrom={row.gift_from}
            etsyOrder={row.etsy_order}
            photoUrl={photoUrl}
            notes={row.notes}
            createdAt={row.created_at}
          />
        ))}
      </div>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { admin } from '@/lib/supabase/admin';
import { IntakeForm } from '../intake-form';

export const metadata: Metadata = {
  title: 'Tell us about your child',
};
export const dynamic = 'force-dynamic';

// Per-order intake surface. Manav pre-creates an intake row via
// scripts/new-order.ts (buyer email + Etsy order number known from the
// sale), mints a token, and sends the buyer a personal link. This page
// looks up the row and hands the buyer a form that only asks the
// creative-brief questions — no re-typing of email / order number.
//
// If the token is missing, revoked, or points to an already-submitted
// row, we fall through to a soft message rather than 404 — the buyer
// might have followed an old link, and the goal is to keep them from
// panicking. They can always message via Etsy.

function Message({ title, body, cta }: { title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div
      style={{
        flex: '1 1 auto',
        display: 'grid',
        placeItems: 'center',
        padding: 'clamp(28px, 6vw, 72px) 24px',
      }}
    >
      <div style={{ maxWidth: 520, textAlign: 'center', display: 'grid', gap: 'var(--space-4)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: 0, color: 'var(--ink)', lineHeight: 1.15 }}>
          {title}
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 17, lineHeight: 1.6 }}>
          {body}
        </p>
        {cta}
      </div>
    </div>
  );
}

export default async function IntakeByTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token) notFound();

  const supa = admin();
  const { data: row } = await supa
    .from('intakes')
    .select('id, status, buyer_email, buyer_name, child_name, etsy_order, gift_from')
    .eq('token', token)
    .maybeSingle();

  if (!row) {
    return (
      <Message
        title="This link doesn't look right."
        body="It may have been retired or copied incorrectly. Message us on Etsy and we'll send a fresh link within a few hours."
        cta={
          <div>
            <Link
              href="/"
              style={{
                padding: '12px 22px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--pill-edge)',
                color: 'var(--ink-soft)',
                textDecoration: 'none',
              }}
            >
              Back to the shop
            </Link>
          </div>
        }
      />
    );
  }

  if (row.status !== 'awaiting') {
    return (
      <Message
        title="We already have your intake."
        body="Style previews will land in your inbox within 24 hours. If something needs changing, reply to that email or message us on Etsy — we'll sort it before we start the illustrations."
      />
    );
  }

  return (
    <IntakeForm
      token={token}
      buyerEmail={row.buyer_email}
      buyerName={row.buyer_name ?? undefined}
      childName={row.child_name ?? undefined}
      etsyOrder={row.etsy_order ?? undefined}
      isGift={Boolean(row.gift_from)}
      giftFrom={row.gift_from ?? undefined}
    />
  );
}

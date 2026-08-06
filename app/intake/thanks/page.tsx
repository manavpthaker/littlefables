import type { Metadata } from 'next';
import Link from 'next/link';
import { Ornament } from '@ds/components/core/Ornament.jsx';

export const metadata: Metadata = {
  title: 'Thanks — Little Fables',
};

// Post-intake confirmation. Named "thanks" to match the marketing page's
// mental model, but the tone here is quieter than a marketing page: the
// buyer has already paid, they don't need to be re-sold, they need to know
// what happens next and roughly when.

export default async function IntakeThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  const kid = name?.trim();

  return (
    <main
      data-density="outward"
      style={{
        minHeight: '100dvh',
        background: 'var(--paper)',
        padding: 'clamp(28px, 6vw, 72px) 24px',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div style={{ maxWidth: 560, textAlign: 'center', display: 'grid', gap: 'var(--space-6)' }}>
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <Ornament />
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-headline-size)',
            margin: 0,
            color: 'var(--ink)',
            lineHeight: 1.15,
          }}
        >
          {kid ? `We've got everything we need for ${kid}.` : "We've got it."}
        </h1>
        <p
          style={{
            margin: 0,
            color: 'var(--ink-soft)',
            fontSize: 'var(--text-body-size)',
            lineHeight: 1.6,
          }}
        >
          Within 24 hours you&rsquo;ll get an email with 2&ndash;4 style previews to
          choose from. Approve the look you love and the full book lands
          3&ndash;4 days later, on any iPad or phone &mdash; no app, no login.
        </p>
        <p
          style={{
            margin: 0,
            color: 'var(--ink-faint)',
            fontSize: 'var(--text-fine-size)',
            lineHeight: 1.6,
          }}
        >
          If you don&rsquo;t see the previews within a day, check your spam folder or
          write to us on Etsy &mdash; we answer quickly. You can close this tab.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
          <Link
            href="/"
            style={{
              padding: '12px 22px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--pill-edge)',
              color: 'var(--ink-soft)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
            }}
          >
            Back to the shop
          </Link>
        </div>
      </div>
    </main>
  );
}

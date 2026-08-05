import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { findRedeemableGift, formatGiftCode } from '@/lib/models/gift-code';
import { RedeemButton } from './redeem-button';

export const metadata: Metadata = { title: 'Your gift · Little Fables' };

// Gift redemption. One-screen orientation before the book:
//   - Whose book (child's name + cover art)
//   - Who it's from ("A gift from Grandma June")
//   - One line of context
//   - A single button: Open the book
//
// The button POSTs to /api/gift/<code>/redeem, which mints a fresh
// child_devices token, drops the cookie, and returns a redirect target
// the client follows. See docs/commerce/delivery-flow.md for the design.

export default async function GiftPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const gift = await findRedeemableGift(code);
  if (!gift) notFound();

  const heading = `A gift for ${gift.childName}`;
  const from = gift.row.gift_from ? `A gift from ${gift.row.gift_from}` : 'A gift';
  // books.cover_bg is the public URL of cover.png uploaded by content:add,
  // not a CSS color. Falls back to a plain paper block when the household
  // has no book imported yet (rare — provisioning docs sequence content:add
  // before gift-code mint).
  const coverUrl = gift.bookCoverBg;

  return (
    <main
      data-density="outward"
      style={{
        minHeight: '100dvh',
        background: 'var(--paper)',
        display: 'grid',
        placeItems: 'center',
        padding: 'clamp(24px, 6vw, 64px) 20px',
        fontFamily: 'var(--font-body)',
        color: 'var(--ink)',
      }}
    >
      <article
        style={{
          maxWidth: 480,
          width: '100%',
          background: 'var(--paper-warm)',
          border: 'var(--border-soft)',
          borderRadius: 'var(--radius-md)',
          padding: 'clamp(24px, 5vw, 40px)',
          display: 'grid',
          gap: 'var(--space-4)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            aspectRatio: '3 / 4',
            width: '65%',
            justifySelf: 'center',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            background: 'var(--paper-warm)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
            position: 'relative',
          }}
        >
          {coverUrl && (
            <Image
              src={coverUrl}
              alt={gift.bookTitle ? `Cover of ${gift.bookTitle}` : "Book cover"}
              fill
              sizes="(max-width: 480px) 65vw, 312px"
              style={{ objectFit: 'cover' }}
              priority
            />
          )}
        </div>
        <div>
          <p
            style={{
              margin: 0,
              color: 'var(--ink-muted)',
              fontSize: 'var(--text-small-size)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {from}
          </p>
          <h1
            style={{
              margin: 'var(--space-1) 0 0',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 5vw, 2.25rem)',
              lineHeight: 1.1,
            }}
          >
            {heading}
          </h1>
          {gift.bookTitle && (
            <p
              style={{
                margin: 'var(--space-2) 0 0',
                color: 'var(--ink)',
                fontSize: 'var(--text-body-size)',
              }}
            >
              <em>{gift.bookTitle}</em>
            </p>
          )}
        </div>
        <p
          style={{
            margin: 0,
            color: 'var(--ink-muted)',
            fontSize: 'var(--text-body-size)',
            lineHeight: 1.55,
          }}
        >
          A custom storybook where {gift.childName} is the main character.
          Tap below to open it.
        </p>
        <RedeemButton code={code} />
        <p
          style={{
            margin: 0,
            color: 'var(--ink-faint)',
            fontSize: 'var(--text-small-size)',
          }}
        >
          Redemption code: <code>{formatGiftCode(code)}</code>
        </p>
      </article>
    </main>
  );
}

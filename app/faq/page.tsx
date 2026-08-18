import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '@ds/components/core/Wordmark.jsx';

export const metadata: Metadata = {
  title: 'FAQ · Little Fables',
  description: 'How Little Fables works — stories, revisions, ages, family projects, learning communities, and privacy.',
};

// A small, real FAQ. Every question is one a buyer has actually asked
// (or will) — no aspirational fluff. Copy stays close to /positioning.md
// so we don't drift between the shop, the intake, and this page.

const QAS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'How long does it take?',
    a: (
      <>
        Style previews land in your inbox within <strong>24 hours</strong> of your
        intake. Once you approve the look, the finished book takes another{' '}
        <strong>3–4 days</strong>. Rush is available.
      </>
    ),
  },
  {
    q: 'What if I don\'t love the previews?',
    a: (
      <>
        We revise until you do — no cap, no upcharge. If we can’t land the
        look you want, you get a full refund. We’d rather part friends than
        ship a book you don’t love.
      </>
    ),
  },
  {
    q: 'What ages is this for?',
    a: (
      <>
        Ages 3 to 10. We tune the sentence rhythm, page count, and vocabulary
        to how your child reads right now — a 4-year-old book has short lines
        and lots of picture; a 9-year-old book reads like an early chapter
        book.
      </>
    ),
  },
  {
    q: 'How do I read the book to my kid?',
    a: (
      <>
        You get a private link that opens on any iPad or phone. No app to
        install, no login for your child. It works offline once loaded. Add
        it to their home screen and it launches like an app.
      </>
    ),
  },
  {
    q: 'Is it a gift?',
    a: (
      <>
        Tell us on the intake and we’ll include a printable certificate
        addressed &ldquo;a gift from {'{'}your name{'}'}&rdquo; that hands over cleanly.
        The recipient parent gets a fresh redemption link — the buyer never
        has to share their own.
      </>
    ),
  },
  {
    q: 'What do you do with our photo / personal details?',
    a: (
      <>
        The photo is a drawing reference — used by us and by the illustration
        tools we draw in. What you get is an illustration inspired by your
        child, not a photograph of them. When your book is delivered we send
        you a link to delete it or keep it on file for a second book; if you
        don’t reply, we delete it. Full detail on the{' '}
        <Link href="/privacy" style={{ color: 'var(--oxblood-text)' }}>
          privacy page
        </Link>
        .
      </>
    ),
  },
  {
    q: 'Can I make another story for the same child or group?',
    a: (
      <>
        Yes. Write to us through the{' '}
        <Link href="/contact" style={{ color: 'var(--oxblood-text)' }}>story idea form</Link>{' '}
        and we’ll talk through what a second story could be.
      </>
    ),
  },
  {
    q: 'Who’s behind Little Fables?',
    a: (
      <>
        One small studio. The person who reads your note is the person who
        writes the story and reviews the art. That’s deliberate — it’s what
        makes each story specific to the child or group it is about.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <div
      data-density="outward"
      style={{
        minHeight: '100dvh',
        background: 'var(--paper)',
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'clamp(14px, 3vw, 22px) clamp(18px, 5vw, 32px)',
          borderBottom: '1px solid rgba(138, 113, 86, 0.16)',
        }}
      >
        <Link href="/" aria-label="Little Fables home" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Wordmark layout="horizontal" markSize={28} />
        </Link>
        <a href="mailto:hello@littlefables.app" style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontSize: 14 }}>
          Contact
        </a>
      </header>

      <main
        style={{
          flex: '1 1 auto',
          padding: 'clamp(32px, 6vw, 80px) clamp(18px, 5vw, 32px)',
          display: 'grid',
          placeItems: 'start center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 680, display: 'grid', gap: 'var(--space-6)' }}>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <span style={{ fontFamily: 'var(--font-sc, var(--font-body))', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
              Frequently asked
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 44px)', margin: 0, color: 'var(--ink)', lineHeight: 1.1, fontWeight: 400 }}>
              A few things people ask before they begin.
            </h1>
            <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 17, lineHeight: 1.55 }}>
              Something not here? Tell us through the{' '}
              <Link href="/contact" style={{ color: 'var(--oxblood-text)' }}>story idea form</Link>{' '}
              or write to <a href="mailto:hello@littlefables.app" style={{ color: 'var(--oxblood)' }}>hello@littlefables.app</a>{' '}
              — a real person answers within a few hours.
            </p>
          </div>

          <dl style={{ display: 'grid', gap: 'var(--space-5)', margin: 0 }}>
            {QAS.map((qa) => (
              <div key={qa.q} style={{ display: 'grid', gap: 8, paddingBottom: 'var(--space-4)', borderBottom: '1px solid rgba(138, 113, 86, 0.18)' }}>
                <dt style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', lineHeight: 1.25 }}>
                  {qa.q}
                </dt>
                <dd style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 17, lineHeight: 1.6 }}>
                  {qa.a}
                </dd>
              </div>
            ))}
          </dl>

          <div style={{ paddingTop: 'var(--space-4)' }}>
            <Link
              href="/intake"
              style={{
                display: 'inline-block',
                padding: '14px 26px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--oxblood)',
                color: 'var(--on-oxblood, #f7f0e0)',
                textDecoration: 'none',
                fontSize: 16,
              }}
            >
              Start your intake →
            </Link>
          </div>
        </div>
      </main>

      <footer
        style={{
          padding: 'clamp(16px, 3vw, 24px) clamp(18px, 5vw, 32px)',
          borderTop: '1px solid rgba(138, 113, 86, 0.16)',
          fontSize: 13,
          color: 'var(--ink-faint)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
        }}
      >
        <span>
          Little Fables · stories around real lives ·{' '}
          <Link href="/privacy" style={{ color: 'var(--ink-faint)' }}>
            Privacy
          </Link>
        </span>
        <a href="mailto:hello@littlefables.app" style={{ color: 'var(--ink-faint)', textDecoration: 'none' }}>
          hello@littlefables.app
        </a>
      </footer>
    </div>
  );
}

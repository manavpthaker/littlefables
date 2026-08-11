import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '@ds/components/core/Wordmark.jsx';

export const metadata: Metadata = {
  title: 'Privacy · Little Fables',
  description:
    'What Little Fables collects, what we do with it, who else sees it, and when we delete it.',
};

// Written to describe what the code actually does, not what would sound best.
// Every retention claim here has an implementation behind it:
//   · the buyer's choice page       app/intake/[token]/photo
//   · the deletion endpoint         app/api/intake/photo/route.ts
//   · the "no reply" sweep          scripts/photo-purge.ts
//   · the columns behind all three  supabase/migrations/20260811000026_*
//
// If any of those are removed, the corresponding paragraph must come out of
// this page in the same commit. A privacy policy that has drifted from the
// system it describes is worse than not having one, because people rely on it.

const UPDATED = '11 August 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--space-2)' }}>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          margin: 0,
          color: 'var(--ink)',
          fontWeight: 400,
          lineHeight: 1.25,
        }}
      >
        {title}
      </h2>
      <div style={{ color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1.65, display: 'grid', gap: 'var(--space-2)' }}>
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
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
            <span
              style={{
                fontFamily: 'var(--font-sc, var(--font-body))',
                fontSize: 12,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
              }}
            >
              Privacy · updated {UPDATED}
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 5vw, 44px)',
                margin: 0,
                color: 'var(--ink)',
                lineHeight: 1.1,
                fontWeight: 400,
              }}
            >
              We ask for a lot about your child. Here is exactly what happens to it.
            </h1>
            <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 17, lineHeight: 1.55 }}>
              Little Fables is a two-person family shop, not a platform. We don&rsquo;t run ads,
              we don&rsquo;t have analytics on this site, and there is nobody to sell your data to.
            </p>
          </div>

          <Section title="What we collect">
            <p style={{ margin: 0 }}>
              Only what you type into the intake form: your email and order number, your
              child&rsquo;s first name and age, their interests and traits, what they look like,
              who else should appear in the book, and the one thing that&rsquo;s been sticky for
              them lately. Optionally, a photograph.
            </p>
            <p style={{ margin: 0 }}>
              You give us this about your child; we never collect anything from a child
              directly. The reading app itself asks children for nothing.
            </p>
          </Section>

          <Section title="What we do with the photo">
            <p style={{ margin: 0 }}>
              We use it as a drawing reference. Someone looks at it while writing the art
              direction, and it is used as a reference by the illustration tools we draw in.
              The result is an illustration inspired by your child &mdash; not a photograph of
              them, and not a traced copy.
            </p>
            <p style={{ margin: 0 }}>
              It is never published, never sold, never used in our shop listings or marketing,
              and never shown to anyone outside the work of making your book.
            </p>
          </Section>

          <Section title="When we delete it">
            <p style={{ margin: 0 }}>
              We keep the photo while we&rsquo;re making the book, because we need it. When your
              book is delivered we send you a link where you choose: delete it, or keep it on
              file so a second book can reuse the same character without you sending it again.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--ink)' }}>If you don&rsquo;t reply, we delete it.</strong>{' '}
              Silence gets the private outcome, not the convenient one. If you choose to keep
              it, you can go back to that same link any time and have it deleted &mdash; the
              choice isn&rsquo;t a one-time question.
            </p>
            <p style={{ margin: 0 }}>
              Deleting removes the file itself. We keep the order record so we know a book was
              made and a photo was deleted, which is the only way we can answer you if you ask.
            </p>
          </Section>

          <Section title="Who else touches it">
            <p style={{ margin: 0 }}>
              The people who help us run the shop, and nobody else:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 6 }}>
              <li>
                <strong style={{ color: 'var(--ink)' }}>Supabase</strong> &mdash; stores the
                intake and the photo. The photo bucket is private; links to it expire.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>Vercel</strong> &mdash; hosts the site.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>Resend</strong> &mdash; sends your
                previews and delivery email.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>ElevenLabs</strong> &mdash; records the
                narration from the book&rsquo;s written text. It never receives your photo.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>Illustration tools</strong> &mdash; the
                image models we draw in receive the photo as reference while the art is made.
              </li>
            </ul>
          </Section>

          <Section title="Asking us to delete something">
            <p style={{ margin: 0 }}>
              Email{' '}
              <a href="mailto:hello@littlefables.app" style={{ color: 'var(--oxblood-text)' }}>
                hello@littlefables.app
              </a>{' '}
              and say so. You don&rsquo;t need a reason and we won&rsquo;t ask for one. We&rsquo;ll
              delete your intake, the photo, and the book from our systems, and confirm when
              it&rsquo;s done. Anything already downloaded to your own device is yours and stays
              there.
            </p>
          </Section>

          <div style={{ paddingTop: 'var(--space-4)' }}>
            <Link
              href="/faq"
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
              Read the FAQ &rarr;
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
        <span>Little Fables · a picture book made for one child</span>
        <a href="mailto:hello@littlefables.app" style={{ color: 'var(--ink-faint)', textDecoration: 'none' }}>
          hello@littlefables.app
        </a>
      </footer>
    </div>
  );
}

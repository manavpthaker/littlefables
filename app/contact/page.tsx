import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '@ds/components/core/Wordmark.jsx';

export const metadata: Metadata = {
  title: 'Tell us your story idea · Little Fables',
  description: 'Tell Little Fables about a child, family, class, or learning community story worth making.',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '12px 14px',
  border: '1px solid var(--border-card)',
  borderRadius: 6,
  background: 'var(--paper)',
  color: 'var(--ink)',
  fontFamily: 'var(--font-body)',
  fontSize: 17,
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div data-density="outward" style={{ minHeight: '100dvh', background: 'var(--paper)', color: 'var(--ink)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-soft)' }}>
        <Link href="/" aria-label="Little Fables home" style={{ color: 'inherit', textDecoration: 'none' }}>
          <Wordmark layout="horizontal" markSize={28} />
        </Link>
        <Link href="/sample" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>Read the demo</Link>
      </header>

      <main style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(40px, 8vw, 88px) 24px' }}>
        <span style={{ fontFamily: 'var(--font-sc)', fontSize: 'var(--text-label-size)', letterSpacing: 'var(--track-label)', color: 'var(--brass)' }}>
          start with a conversation
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-size)', lineHeight: 1.12, margin: '12px 0 18px' }}>
          Tell us the story you’re carrying around.
        </h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 'calc(var(--text-body-size)*1.08)', lineHeight: 1.6, maxWidth: '34em', margin: '0 0 34px' }}>
          It might be about one child, a family moment, a class project, or a place a small group keeps returning to. This is not a checkout or an order form. Tell us what happened, and we’ll reply with an honest sense of whether Little Fables is the right shape for it.
        </p>
        {params.error ? (
          <p role="alert" style={{ color: 'var(--oxblood)', lineHeight: 1.5 }}>
            We couldn’t send that note just now. Please email hello@littlefables.app and we’ll get back to you.
          </p>
        ) : null}

        <form action="/api/contact" method="post" style={{ display: 'grid', gap: 20 }}>
          <label style={{ display: 'grid', gap: 7 }}>
            <span style={{ color: 'var(--ink-soft)' }}>Your name</span>
            <input name="name" required maxLength={120} autoComplete="name" style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: 7 }}>
            <span style={{ color: 'var(--ink-soft)' }}>Email</span>
            <input name="email" type="email" required maxLength={254} autoComplete="email" style={inputStyle} />
          </label>
          <label style={{ display: 'grid', gap: 7 }}>
            <span style={{ color: 'var(--ink-soft)' }}>What brings you here?</span>
            <select name="context" required defaultValue="" style={inputStyle}>
              <option value="" disabled>Select one</option>
              <option value="family">A story for one child or family</option>
              <option value="learning-community">A class, co-op, or microschool project</option>
              <option value="other">Something else</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 7 }}>
            <span style={{ color: 'var(--ink-soft)' }}>What would you like to make or remember?</span>
            <textarea name="message" required maxLength={4000} rows={7} style={{ ...inputStyle, resize: 'vertical' }} />
          </label>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }} />
          <button type="submit" className="lf-btn lf-btn--primary" style={{ justifySelf: 'start' }}>
            Send the idea
          </button>
          <p style={{ color: 'var(--ink-faint)', fontSize: 'var(--text-caption-size)', lineHeight: 1.5, margin: 0 }}>
            No child photos or identifying details are needed for this first note.
          </p>
        </form>
      </main>
    </div>
  );
}

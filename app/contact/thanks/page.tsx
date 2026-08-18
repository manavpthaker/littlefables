import Link from 'next/link';

export default function ContactThanksPage() {
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--paper)', color: 'var(--ink)' }}>
      <div style={{ maxWidth: 560, textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-size)', lineHeight: 1.15 }}>Thank you for telling us.</h1>
        <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>We’ll read it and reply soon. If it feels like a Little Fables story, we’ll talk through what making it could look like.</p>
        <Link href="/" className="lf-btn lf-btn--secondary" style={{ display: 'inline-block', marginTop: 16, textDecoration: 'none' }}>Back to Little Fables</Link>
      </div>
    </main>
  );
}

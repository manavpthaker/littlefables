// The shared shelf — what a library-share link opens to. Same printed-cover
// grid as the household library, but every cover links back through the
// share token, so the guest never touches household auth.

export interface SharedShelfBook {
  id: string;
  title: string;
  coverImage?: string;
  coverBg?: string | null;
}

export function SharedLibrary({ token, books }: { token: string; books: SharedShelfBook[] }) {
  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'var(--paper)',
        padding: 'var(--space-7) var(--page-pad) var(--space-6)',
        boxSizing: 'border-box',
        display: 'grid',
        alignContent: 'start',
        gap: 'var(--space-6)',
      }}
    >
      <header style={{ display: 'grid', justifyItems: 'center', gap: 8, textAlign: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-sc, var(--font-body))',
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--brass)',
          }}
        >
          Little Fables
        </span>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 5vw, 34px)',
            color: 'var(--ink)',
          }}
        >
          A shelf, shared with you
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: 15,
            color: 'var(--ink-soft)',
          }}
        >
          Tap a cover to read.
        </p>
      </header>

      <div className="lf-covers" style={{ maxWidth: 920, width: '100%', marginInline: 'auto' }}>
        {books.map((b) => (
          <a
            key={b.id}
            href={`/share/${token}?book=${encodeURIComponent(b.id)}`}
            className="lf-cover"
            aria-label={b.title}
          >
            <span
              className="lf-cover-art"
              aria-hidden
              style={
                b.coverImage
                  ? { backgroundImage: `url(${b.coverImage})` }
                  : b.coverBg && !b.coverBg.startsWith('http')
                    ? { background: b.coverBg }
                    : undefined
              }
            />
            <span className="lf-cover-band">
              <span className="lf-cover-imprint">Little Fables</span>
              <span className="lf-cover-title">{b.title}</span>
              <span className="lf-cover-rule" aria-hidden />
            </span>
            <span className="lf-cover-spine" aria-hidden />
          </a>
        ))}
      </div>

      <footer style={{ textAlign: 'center' }}>
        <a
          href="https://littlefables.app"
          style={{
            fontFamily: 'var(--font-sc, var(--font-body))',
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            textDecoration: 'none',
          }}
        >
          littlefables.app
        </a>
      </footer>
    </main>
  );
}

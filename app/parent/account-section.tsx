// Account panel — who is signed in, which household this session opens,
// and the primary Sign out. Renders inside /parent/settings so the whole
// account context lives on one page instead of just as a nav-bar chip.
//
// Server component: no interactivity needed. Sign out is an anchor to
// /api/parent/logout, which clears the cookies and 302s to /login.

interface Props {
  parentDisplayName: string;
  parentEmail: string;
  householdName: string;
}

export function AccountSection({ parentDisplayName, parentEmail, householdName }: Props) {
  return (
    <section
      aria-labelledby="account-heading"
      style={{
        background: 'var(--paper-warm)',
        border: 'var(--border-soft)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-5) var(--space-5)',
        display: 'grid',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
        <span
          style={{
            fontFamily: 'var(--font-sc)',
            fontSize: 'var(--text-label-size)',
            letterSpacing: 'var(--track-label)',
            color: 'var(--brass)',
          }}
        >
          your account
        </span>
        <h2
          id="account-heading"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-title-size)',
            margin: 0,
            color: 'var(--ink)',
          }}
        >
          {householdName}
        </h2>
      </div>

      <dl
        style={{
          margin: 0,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: 'var(--space-4)',
          rowGap: 'var(--space-2)',
          alignItems: 'baseline',
          fontSize: 'var(--text-body-size)',
        }}
      >
        <dt style={dtStyle}>Signed in as</dt>
        <dd style={ddStyle}>
          {parentDisplayName}
          <span style={{ color: 'var(--ink-faint)' }}> · {parentEmail}</span>
        </dd>
      </dl>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border-ornament)',
          paddingTop: 'var(--space-4)',
        }}
      >
        <span
          style={{
            color: 'var(--ink-muted)',
            fontSize: 'var(--text-small-size)',
            maxWidth: '38em',
          }}
        >
          Sign-in link goes to this email. Sign out clears this browser only; other devices with a
          valid kid-token stay open on the reader.
        </span>
        <a href="/api/parent/logout" className="lf-btn lf-btn--secondary" style={{ textDecoration: 'none' }}>
          Sign out
        </a>
      </div>
    </section>
  );
}

const dtStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-sc)',
  fontSize: 'var(--text-label-size)',
  letterSpacing: 'var(--track-label)',
  color: 'var(--ink-muted)',
};

const ddStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--ink)',
};

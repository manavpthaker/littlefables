import { MakerForm } from './maker-form';

export default function MakePage() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <header>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Make a story</h1>
        <p style={{ color: 'var(--ink-soft)', margin: 'var(--space-1) 0 0' }}>
          One prompt. Everything else — the hero, the setting, the culture, the ending — is the system&apos;s job.
        </p>
      </header>
      <MakerForm />
    </main>
  );
}

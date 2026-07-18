import { redirect } from 'next/navigation';
import { isParentAuthed } from '@/lib/server/parent-gate';
import { GateForm } from './gate-form';

export default async function GatePage() {
  if (await isParentAuthed()) redirect('/parent');
  return (
    <main
      style={{
        maxWidth: 420,
        margin: '10dvh auto',
        display: 'grid',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      <header>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)', margin: 0 }}>
          Parent Corner
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 'var(--space-1) 0 0' }}>
          Enter the household password to review stories, art, and Azad&apos;s Q&amp;As.
        </p>
      </header>
      <GateForm />
    </main>
  );
}

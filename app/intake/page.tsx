import type { Metadata } from 'next';
import { IntakeForm } from './intake-form';

export const metadata: Metadata = {
  title: 'Tell us about your child',
};

// Buyer intake. Today this is the surface the walkthrough film records and a
// place to pressure-test the questions; it is deliberately the same shape as
// the Typeform in docs/commerce/intake-typeform.md so the two can be compared
// before we commit to self-hosting.
//
// Nothing is persisted yet — submitting logs to the console. Wiring it to
// Postgres is what would let us retire Typeform, keep the privacy promise
// literally true, and make the saved-profile flow real.

export default function IntakePage() {
  return (
    <main
      data-density="outward"
      style={{
        minHeight: '100dvh',
        background: 'var(--paper)',
        padding: 'clamp(28px, 6vw, 72px) 24px',
      }}
    >
      <IntakeForm />
    </main>
  );
}

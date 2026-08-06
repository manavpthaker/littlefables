import type { Metadata } from 'next';
import { IntakeForm } from './intake-form';

export const metadata: Metadata = {
  title: 'Tell us about your child',
};

// Walk-up intake surface. The primary intake path is /intake/[token] —
// Manav pre-creates a row from every Etsy sale and messages the buyer
// their personal link, so most buyers never touch this page.
//
// This page is the safety net: someone who lost their link, an in-person
// friend / family order, or a soft-launched non-Etsy buyer. It asks for
// email + Etsy order so Manav can reconcile in /parent/intakes.

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
      <div
        style={{
          maxWidth: 660,
          margin: '0 auto var(--space-6)',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--pill-edge)',
          background: 'var(--paper-warm)',
          color: 'var(--ink-soft)',
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        If you bought on Etsy, look for a personal link in your Etsy messages —
        it saves you re-typing your email. No link? Fill this in and we&rsquo;ll
        match it to your order.
      </div>
      <IntakeForm />
    </main>
  );
}

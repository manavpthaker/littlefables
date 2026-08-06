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
  return <IntakeForm />;
}

import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/server/resend-mailer';

export const runtime = 'nodejs';

const MAX_MESSAGE = 4000;

function value(form: FormData, key: string): string {
  const raw = form.get(key);
  return typeof raw === 'string' ? raw.trim() : '';
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

export async function POST(request: Request) {
  const form = await request.formData();
  if (value(form, 'website')) return NextResponse.redirect(new URL('/contact/thanks', request.url), 303);

  const name = value(form, 'name');
  const email = value(form, 'email').toLowerCase();
  const context = value(form, 'context');
  const message = value(form, 'message');
  const notify = process.env.CONTACT_NOTIFY_EMAIL || process.env.INTAKE_NOTIFY_EMAIL || process.env.RESEND_FROM_EMAIL;

  if (!name || !validEmail(email) || !context || !message || message.length > MAX_MESSAGE || !notify) {
    return NextResponse.redirect(new URL('/contact?error=1', request.url), 303);
  }

  const contextLabel = context === 'learning-community'
    ? 'Class, co-op, or microschool project'
    : context === 'family' ? 'One child or family story' : 'Something else';

  try {
    await sendEmail({
      to: notify,
      subject: `Little Fables inquiry — ${contextLabel}`,
      text: [`Name: ${name}`, `Email: ${email}`, `Context: ${contextLabel}`, '', message].join('\n'),
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Context:</strong> ${escapeHtml(contextLabel)}</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    });
  } catch (error) {
    console.error('contact notification failed', error);
    return NextResponse.redirect(new URL('/contact?error=1', request.url), 303);
  }

  return NextResponse.redirect(new URL('/contact/thanks', request.url), 303);
}

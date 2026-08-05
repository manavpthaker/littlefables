'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Two-step form: email → code. State is local; nothing renders the raw
// backend messages (they leak whether an email is provisioned). We show
// the same "check your email" text either way.

type Step = 'email' | 'code' | 'done';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/parent/login/send-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.status === 429) {
        // Rate-limited — but we still advance to the code step. If the
        // user already got an earlier code, they can use that; otherwise
        // they'll wait 60s and retry.
        setStep('code');
        setError('Waiting on the last code we sent — check your email, or try again in a minute.');
        return;
      }
      if (!res.ok) throw new Error('send failed');
      setStep('code');
    } catch {
      setError('Something went wrong. Try again in a minute.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/parent/login/verify-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), token: code.trim() }),
      });
      if (res.status === 401) {
        setError("That code didn't match. Check your email and try again.");
        return;
      }
      if (res.status === 403) {
        setError('This email is not set up for parent access yet.');
        return;
      }
      if (!res.ok) throw new Error('verify failed');
      setStep('done');
      router.push('/parent');
      router.refresh();
    } catch {
      setError('Something went wrong. Try again in a minute.');
    } finally {
      setBusy(false);
    }
  }

  const card = {
    background: 'var(--paper-warm)',
    border: 'var(--border-soft)',
    borderRadius: 'var(--radius-md)',
    padding: 'clamp(20px, 4vw, 32px)',
    maxWidth: 420,
    width: '100%',
    fontFamily: 'var(--font-body)',
    color: 'var(--ink)',
  } as const;
  const input = {
    width: '100%',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--ink-faint)',
    background: 'var(--paper)',
    color: 'var(--ink)',
    fontSize: 'var(--text-body-size)',
    fontFamily: 'var(--font-body)',
  } as const;
  const button = {
    width: '100%',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--oxblood)',
    color: 'var(--paper)',
    border: 'none',
    fontSize: 'var(--text-body-size)',
    fontWeight: 600,
    cursor: 'pointer',
    opacity: busy ? 0.6 : 1,
  } as const;

  return (
    <div style={card}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-title-size)',
          margin: '0 0 var(--space-2)',
        }}
      >
        Parent sign-in
      </h1>
      <p
        style={{
          margin: '0 0 var(--space-4)',
          color: 'var(--ink-muted)',
          fontSize: 'var(--text-small-size)',
        }}
      >
        {step === 'email'
          ? "We'll email you a 6-digit code. No password."
          : `Enter the code we sent to ${email}.`}
      </p>

      {step === 'email' && (
        <form onSubmit={sendCode} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <label htmlFor="email" style={{ display: 'grid', gap: 'var(--space-1)' }}>
            <span style={{ fontSize: 'var(--text-small-size)', color: 'var(--ink-muted)' }}>Email</span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={input}
              disabled={busy}
            />
          </label>
          <button type="submit" disabled={busy} style={button}>
            {busy ? 'Sending…' : 'Send code'}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={verifyCode} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <label htmlFor="code" style={{ display: 'grid', gap: 'var(--space-1)' }}>
            <span style={{ fontSize: 'var(--text-small-size)', color: 'var(--ink-muted)' }}>Code</span>
            <input
              id="code"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              required
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              style={{ ...input, letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.5rem' }}
              disabled={busy}
            />
          </label>
          <button type="submit" disabled={busy} style={button}>
            {busy ? 'Verifying…' : 'Open storytime'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setStep('email');
              setCode('');
              setError(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink-muted)',
              fontSize: 'var(--text-small-size)',
              cursor: 'pointer',
              padding: 'var(--space-2)',
            }}
          >
            Use a different email
          </button>
        </form>
      )}

      {error && (
        <p
          role="alert"
          style={{
            marginTop: 'var(--space-3)',
            color: 'var(--oxblood)',
            fontSize: 'var(--text-small-size)',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

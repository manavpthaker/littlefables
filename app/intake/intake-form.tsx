'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const INTERESTS = [
  'dinosaurs', 'space', 'horses', 'soccer', 'dance', 'pirates',
  'dragons', 'building things', 'animals', 'princesses', 'robots',
  'ocean', 'magic', 'music', 'trains', 'bugs', 'unicorns', 'dogs',
];

const TRAITS = [
  'brave', 'curious', 'funny', 'kind', 'stubborn', 'shy', 'wild',
  'thoughtful', 'bossy', 'gentle', 'silly', 'careful', 'dramatic',
  'adventurous', 'sensitive', 'determined', 'dreamy', 'mischievous',
];

const AGES = ['3–4', '5–6', '7–8', '9+'];

export interface IntakeFormProps {
  /** Optional pre-order token from /intake/[token]. When present, the buyer
   *  has already been identified by Etsy order + email and we skip the
   *  self-identification fields. */
  token?: string;
  buyerEmail?: string;
  buyerName?: string;
  childName?: string;
  etsyOrder?: string;
  isGift?: boolean;
  giftFrom?: string;
}

export function IntakeForm(props: IntakeFormProps) {
  const router = useRouter();
  const hasToken = Boolean(props.token);

  const [buyerEmail, setBuyerEmail] = useState(props.buyerEmail ?? '');
  const [name, setName] = useState(props.childName ?? '');
  const [age, setAge] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [traits, setTraits] = useState<string[]>([]);
  const [inspirations, setInspirations] = useState('');
  const [look, setLook] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGift, setIsGift] = useState(props.isGift ?? false);
  const [giftFrom, setGiftFrom] = useState(props.giftFrom ?? '');
  const [etsyOrder, setEtsyOrder] = useState(props.etsyOrder ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kid = name.trim() || 'your child';
  const greeting = props.buyerName?.trim().split(/\s+/)[0];

  function toggle(list: string[], set: (v: string[]) => void, value: string, max: number) {
    if (list.includes(value)) set(list.filter((v) => v !== value));
    else if (list.length < max) set([...list, value]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = new FormData();
      if (props.token) body.set('token', props.token);
      if (!hasToken) body.set('buyer_email', buyerEmail.trim());
      body.set('child_name', name.trim());
      if (age) body.set('age_band', age);
      interests.forEach((v) => body.append('interests', v));
      traits.forEach((v) => body.append('traits', v));
      if (inspirations.trim()) body.set('inspirations', inspirations.trim());
      if (look.trim()) body.set('look', look.trim());
      if (isGift && giftFrom.trim()) body.set('gift_from', giftFrom.trim());
      if (!hasToken && etsyOrder.trim()) body.set('etsy_order', etsyOrder.trim());
      if (photoFile) body.set('photo', photoFile);

      const res = await fetch('/api/intake', { method: 'POST', body });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; id?: string; error?: string } | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `submission failed (${res.status})`);
      }
      router.push(`/intake/thanks?name=${encodeURIComponent(name.trim())}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went sideways — try again in a minute');
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ maxWidth: 660, margin: '0 auto', display: 'grid', gap: 'var(--space-8)' }}
    >
      <header style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <span className="lf-eyebrow">A book written for one child</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-size)', margin: 0, color: 'var(--ink)' }}>
          {greeting ? `Hello, ${greeting}.` : 'Tell us about your child.'}
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 'var(--text-body-size)', lineHeight: 1.6 }}>
          {hasToken
            ? 'About five minutes. We send style previews within 24 hours — you approve the look before we build the book.'
            : 'About five minutes. We send style previews within 24 hours — you approve the look before we build the book.'}
        </p>
      </header>

      {hasToken && buyerEmail && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--pill-edge)',
            background: 'var(--paper-warm)',
            fontSize: 14,
            color: 'var(--ink-soft)',
            display: 'grid',
            gap: 4,
          }}
        >
          <div>Previews and delivery go to <strong style={{ color: 'var(--ink)' }}>{buyerEmail}</strong>.</div>
          {props.etsyOrder && (
            <div style={{ color: 'var(--ink-faint)', fontSize: 12 }}>
              For Etsy order #{props.etsyOrder}
            </div>
          )}
        </div>
      )}

      {!hasToken && (
        <Field label="Where should we send the previews?" help="Your email. We only use it for this book.">
          <input
            className="lf-input"
            type="email"
            required
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Your email"
            autoComplete="email"
          />
        </Field>
      )}

      <Field label="What's their name?" help="This is how they'll appear in the book. Nicknames welcome.">
        <input
          className="lf-input"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Rosa"
          aria-label="Child's name"
        />
      </Field>

      <Field label={`How old is ${kid}?`} help="We match the reading level and page count to their age.">
        <div className="lf-chips">
          {AGES.map((a) => (
            <button
              key={a}
              type="button"
              className="lf-chip"
              aria-pressed={age === a}
              onClick={() => setAge(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </Field>

      <Field label={`What does ${kid} love?`} help="Pick up to three. These become the world of the story.">
        <div className="lf-chips">
          {INTERESTS.map((v) => (
            <button
              key={v}
              type="button"
              className="lf-chip"
              aria-pressed={interests.includes(v)}
              onClick={() => toggle(interests, setInterests, v, 3)}
            >
              {v}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="Two words a grown-up would use to describe them"
        help="Brave characters take on dragons. Gentle ones save butterflies."
      >
        <div className="lf-chips">
          {TRAITS.map((v) => (
            <button
              key={v}
              type="button"
              className="lf-chip"
              aria-pressed={traits.includes(v)}
              onClick={() => toggle(traits, setTraits, v, 2)}
            >
              {v}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="What picture books do you love the look of?"
        help="Two or three. We build the art style from your taste, not a dropdown of five presets."
      >
        <textarea
          className="lf-input"
          rows={3}
          value={inspirations}
          onChange={(e) => setInspirations(e.target.value)}
          placeholder="The Snowy Day · Julia Denos watercolour · anything Oliver Jeffers"
          aria-label="Art inspirations"
        />
      </Field>

      <Field
        label={`What does ${kid} look like?`}
        help="Hair, skin, a favourite outfit, the missing tooth. Or send a photo and we'll work from that."
      >
        <textarea
          className="lf-input"
          rows={3}
          value={look}
          onChange={(e) => setLook(e.target.value)}
          placeholder="Dark curly hair, warm brown skin, always in her green cardigan and scuffed boots."
          aria-label="What the child looks like"
        />

        <label className="lf-upload" aria-label="Add a photo">
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setPhotoFile(f);
              setPhotoPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
          {photoPreview ? (
            <span className="lf-upload-done">
              <img src={photoPreview} alt="" className="lf-upload-thumb" />
              <span>
                Photo added
                <em>reference only — deleted with the rest of your intake</em>
              </span>
            </span>
          ) : (
            <span className="lf-upload-empty">
              <span className="lf-upload-plus" aria-hidden>+</span>
              <span>
                Add a photo
                <em>optional · we work from it, we don&rsquo;t copy it</em>
              </span>
            </span>
          )}
        </label>
      </Field>

      {!props.isGift && (
        <Field label="Is this a gift?" help="If it is, whose name should we put on the certificate?">
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ink-soft)' }}>
            <input
              type="checkbox"
              checked={isGift}
              onChange={(e) => setIsGift(e.target.checked)}
            />
            Yes, this is a gift.
          </label>
          {isGift && (
            <input
              className="lf-input"
              value={giftFrom}
              onChange={(e) => setGiftFrom(e.target.value)}
              placeholder="Grandma June"
              aria-label="Gift from"
              style={{ marginTop: 8 }}
            />
          )}
        </Field>
      )}

      {!hasToken && (
        <Field label="Etsy order number" help="Optional — helps us match this to your purchase.">
          <input
            className="lf-input"
            value={etsyOrder}
            onChange={(e) => setEtsyOrder(e.target.value)}
            placeholder="e.g. 3852749102"
            aria-label="Etsy order number"
          />
        </Field>
      )}

      {error && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--oxblood)',
            background: 'var(--oxblood-wash)',
            color: 'var(--oxblood-text)',
            fontSize: 'var(--text-fine-size)',
          }}
        >
          {error}
        </div>
      )}

      <button type="submit" className="lf-submit" disabled={submitting} aria-busy={submitting}>
        {submitting ? 'Sending…' : 'Send this to the studio'}
      </button>

      <p style={{ margin: 0, textAlign: 'center', color: 'var(--ink-faint)', fontSize: 'var(--text-fine-size)' }}>
        We delete everything here once the book is delivered — unless you ask us to keep it.
      </p>
    </form>
  );
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <div style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title-size)', color: 'var(--ink)' }}>
          {label}
        </span>
        {help && (
          <span style={{ color: 'var(--ink-soft)', fontSize: 'var(--text-fine-size)', lineHeight: 1.5 }}>
            {help}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

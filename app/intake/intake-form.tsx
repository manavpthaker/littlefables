'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

// Step-per-screen intake form. One question at a time, Typeform-style:
// bigger question copy, roomy body text, and every multi-choice question
// pairs its pill selection with an optional "anything more?" text field
// so a parent can add specifics the chip list can't capture.
//
// The form is a single client component even though the layout is
// stepped, because we need cross-step state and one final POST. Steps
// live in the STEPS array below; keep it declarative so re-ordering or
// adding a step is a one-place edit.

const INTEREST_SUGGESTIONS = [
  'dinosaurs', 'space', 'horses', 'soccer', 'dance', 'pirates',
  'dragons', 'building things', 'animals', 'princesses', 'robots',
  'ocean', 'magic', 'music', 'trains', 'bugs', 'unicorns', 'dogs',
  'cats', 'ballet', 'baking', 'painting', 'science', 'trucks',
  'fairies', 'superheroes', 'football', 'gardening', 'bikes',
];

const TRAIT_SUGGESTIONS = [
  'brave', 'curious', 'funny', 'kind', 'stubborn', 'shy', 'wild',
  'thoughtful', 'bossy', 'gentle', 'silly', 'careful', 'dramatic',
  'adventurous', 'sensitive', 'determined', 'dreamy', 'mischievous',
  'quiet', 'chatty', 'observant', 'ambitious', 'loving', 'playful',
];

export interface IntakeFormProps {
  token?: string;
  buyerEmail?: string;
  buyerName?: string;
  childName?: string;
  etsyOrder?: string;
  isGift?: boolean;
  giftFrom?: string;
}

interface Step {
  key: string;
  render: () => React.ReactNode;
  isValid: () => boolean;
  hint?: string;
}

export function IntakeForm(props: IntakeFormProps) {
  const router = useRouter();
  const hasToken = Boolean(props.token);

  const [buyerEmail, setBuyerEmail] = useState(props.buyerEmail ?? '');
  const [etsyOrder, setEtsyOrder] = useState(props.etsyOrder ?? '');
  const [name, setName] = useState(props.childName ?? '');
  const [age, setAge] = useState<number>(5);
  const [ageTouched, setAgeTouched] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestsNote, setInterestsNote] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [traitsNote, setTraitsNote] = useState('');
  const [inspirations, setInspirations] = useState('');
  const [look, setLook] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [companions, setCompanions] = useState('');
  const [isGift, setIsGift] = useState(props.isGift ?? false);
  const [giftFrom, setGiftFrom] = useState(props.giftFrom ?? '');

  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kid = name.trim() || 'your child';
  const greeting = props.buyerName?.trim().split(/\s+/)[0];

  // --- Steps ---------------------------------------------------------------

  const steps: Step[] = useMemo(() => {
    const s: Step[] = [];

    s.push({
      key: 'welcome',
      isValid: () => true,
      render: () => (
        <StepCard
          eyebrow="A book made for one child"
          question={greeting ? `Hi ${greeting} — let's begin.` : "Let's begin."}
          body="About five minutes. You approve the art before we build the book, and everything stays yours."
        />
      ),
    });

    if (!hasToken) {
      s.push({
        key: 'email',
        isValid: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim()),
        hint: 'Press Enter to continue',
        render: () => (
          <StepCard
            eyebrow="Where should we send the previews?"
            question="Your email address."
            body="We only use this to send you previews and the finished book. No lists, no marketing."
          >
            <input
              className="lf-intake-input"
              type="email"
              autoFocus
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Your email"
              autoComplete="email"
            />
          </StepCard>
        ),
      });

      s.push({
        key: 'etsy',
        isValid: () => true,
        hint: 'Optional',
        render: () => (
          <StepCard
            eyebrow="If you bought on Etsy"
            question="Your Etsy order number."
            body="Optional — helps us match this to your purchase. Skip if you're not on Etsy."
          >
            <input
              className="lf-intake-input"
              autoFocus
              value={etsyOrder}
              onChange={(e) => setEtsyOrder(e.target.value)}
              placeholder="e.g. 3852749102"
              aria-label="Etsy order number"
            />
          </StepCard>
        ),
      });
    }

    s.push({
      key: 'name',
      isValid: () => name.trim().length > 0,
      hint: 'Press Enter to continue',
      render: () => (
        <StepCard
          eyebrow="The main character"
          question="What is their name?"
          body="This is how they'll appear in the story. Nicknames are welcome — write it exactly as you'd want it printed."
        >
          <input
            className="lf-intake-input"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rosa"
            aria-label="Child's name"
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'age',
      isValid: () => ageTouched || age > 0,
      render: () => (
        <StepCard
          eyebrow={`About ${kid}`}
          question={`How old is ${kid}?`}
          body="Slide to their age — we tune sentence rhythm, page count, and vocabulary to match how they read right now."
        >
          <AgeSlider
            value={age}
            onChange={(v) => {
              setAge(v);
              setAgeTouched(true);
            }}
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'interests',
      isValid: () => interests.length > 0,
      render: () => (
        <StepCard
          eyebrow={`What lights ${kid} up`}
          question={`What does ${kid} love?`}
          body="Type or pick up to three. These become the world of the story. Add your own if we don't have it."
        >
          <Combobox
            value={interests}
            onChange={setInterests}
            suggestions={INTEREST_SUGGESTIONS}
            max={3}
            placeholder="dinosaurs · space · horses…"
            aria-label="Interests"
          />
          <MoreDetail
            value={interestsNote}
            onChange={setInterestsNote}
            placeholder="e.g. horses, but only Icelandic ones · dinosaurs, especially the plant-eaters"
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'traits',
      isValid: () => traits.length > 0,
      render: () => (
        <StepCard
          eyebrow="How they show up"
          question="Two words a grown-up would use to describe them."
          body="Type or pick up to two. Brave characters take on dragons; gentle ones save butterflies."
        >
          <Combobox
            value={traits}
            onChange={setTraits}
            suggestions={TRAIT_SUGGESTIONS}
            max={2}
            placeholder="brave · curious · silly…"
            aria-label="Traits"
          />
          <MoreDetail
            value={traitsNote}
            onChange={setTraitsNote}
            placeholder="e.g. curious about tiny things · brave except at the dentist"
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'inspirations',
      isValid: () => inspirations.trim().length > 0,
      render: () => (
        <StepCard
          eyebrow="What the book should feel like"
          question="What picture books do you love the look of?"
          body="Two or three is plenty. We build the art style from your taste, not a dropdown of presets."
        >
          <textarea
            className="lf-intake-input lf-intake-textarea"
            autoFocus
            rows={4}
            value={inspirations}
            onChange={(e) => setInspirations(e.target.value)}
            placeholder="The Snowy Day · anything by Oliver Jeffers · Julia Denos watercolour · Where the Wild Things Are…"
            aria-label="Art inspirations"
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'look',
      isValid: () => look.trim().length > 0 || photoFile !== null,
      render: () => (
        <StepCard
          eyebrow={`What ${kid} looks like`}
          question="Describe them in a sentence or two."
          body="Hair, skin, a favourite outfit, the missing tooth. Or add a photo below — we work from it, we don't copy it."
        >
          <textarea
            className="lf-intake-input lf-intake-textarea"
            autoFocus
            rows={3}
            value={look}
            onChange={(e) => setLook(e.target.value)}
            placeholder="Dark curly hair, warm brown skin, always in her green cardigan and scuffed boots."
            aria-label="What the child looks like"
          />
          <label className="lf-intake-upload" aria-label="Add a photo">
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
              <span className="lf-intake-upload-done">
                <img src={photoPreview} alt="" className="lf-intake-upload-thumb" />
                <span>
                  <strong>Photo added.</strong>
                  <em>reference only — deleted with the rest of your intake</em>
                </span>
              </span>
            ) : (
              <span className="lf-intake-upload-empty">
                <span className="lf-intake-upload-plus" aria-hidden>+</span>
                <span>
                  <strong>Add a photo</strong>
                  <em>optional · we work from it, we don&rsquo;t copy it</em>
                </span>
              </span>
            )}
          </label>
        </StepCard>
      ),
    });

    s.push({
      key: 'companions',
      isValid: () => true,
      hint: 'Optional — leave blank if it\'s just them',
      render: () => (
        <StepCard
          eyebrow="Who else is in the story"
          question={`Anyone else who should appear alongside ${kid}?`}
          body="We only draw people you tell us about — no invented parents, coaches, or siblings. Name them and describe how they look. Leave blank if the book stars only your child (that's a common choice; mentor voices become the ball, the moon, a favourite toy)."
        >
          <textarea
            className="lf-intake-input lf-intake-textarea"
            autoFocus
            rows={3}
            value={companions}
            onChange={(e) => setCompanions(e.target.value)}
            placeholder="e.g. Papa — tall, glasses, warm beard. Big sister Priya — 6, straight hair to shoulders, always in pink. Or leave blank."
            aria-label="Who else appears"
          />
        </StepCard>
      ),
    });

    if (!props.isGift) {
      s.push({
        key: 'gift',
        isValid: () => !isGift || giftFrom.trim().length > 0,
        render: () => (
          <StepCard
            eyebrow="If this is a gift"
            question="Should we address it from someone?"
            body="If this is a gift, tell us who — we'll put it on the certificate you can print. Skip if it's for your own kid."
          >
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                color: 'var(--ink-soft)',
                fontSize: 16,
                padding: '10px 14px',
                border: '1px solid var(--pill-edge)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--paper-warm)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
              />
              Yes, this is a gift
            </label>
            {isGift && (
              <input
                className="lf-intake-input"
                autoFocus
                value={giftFrom}
                onChange={(e) => setGiftFrom(e.target.value)}
                placeholder="Grandma June"
                aria-label="Gift from"
                style={{ marginTop: 12 }}
              />
            )}
          </StepCard>
        ),
      });
    }

    s.push({
      key: 'review',
      isValid: () => true,
      render: () => (
        <StepCard
          eyebrow="One more look"
          question="Ready to send this over?"
          body="Once you send, previews land within 24 hours. You can still change anything — just reply to that email."
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
            <Row label="For">{name || '—'}, {age}{Number.isInteger(age) ? '' : ''} yrs</Row>
            <Row label="Loves">{interests.join(', ') || '—'}</Row>
            <Row label="Traits">{traits.join(', ') || '—'}</Row>
            <Row label="Inspiration">{inspirations || '—'}</Row>
            <Row label="Cast">{companions.trim() ? companions : `Just ${name || 'the child'}`}</Row>
            {isGift && giftFrom && <Row label="Gift from">{giftFrom}</Row>}
            <Row label="Sent to">{buyerEmail || props.buyerEmail || '—'}</Row>
          </ul>
        </StepCard>
      ),
    });

    return s;
  }, [
    hasToken, greeting, buyerEmail, etsyOrder, name, age, ageTouched, kid,
    interests, interestsNote, traits, traitsNote, inspirations, look,
    photoFile, photoPreview, companions, isGift, giftFrom, props.isGift, props.buyerEmail,
  ]);

  const totalSteps = steps.length;
  const current: Step | undefined = steps[stepIndex];
  const isLast = stepIndex === totalSteps - 1;

  function goNext() {
    setError(null);
    if (!current || !current.isValid()) {
      setError('This one needs an answer to continue.');
      return;
    }
    if (isLast) {
      void submit();
    } else {
      setStepIndex(stepIndex + 1);
    }
  }

  function goBack() {
    setError(null);
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  // Enter to advance for text inputs; not for textareas (they need line breaks).
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA') return;
    if (target.tagName === 'BUTTON' && target.getAttribute('type') !== 'submit') return;
    e.preventDefault();
    goNext();
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const body = new FormData();
      if (props.token) body.set('token', props.token);
      if (!hasToken) body.set('buyer_email', buyerEmail.trim());
      if (!hasToken && etsyOrder.trim()) body.set('etsy_order', etsyOrder.trim());
      body.set('child_name', name.trim());
      body.set('age_years', String(age));
      body.set('age_band', ageToBand(age));
      interests.forEach((v) => body.append('interests', v));
      traits.forEach((v) => body.append('traits', v));
      if (interestsNote.trim()) body.set('interests_note', interestsNote.trim());
      if (traitsNote.trim()) body.set('traits_note', traitsNote.trim());
      if (inspirations.trim()) body.set('inspirations', inspirations.trim());
      if (look.trim()) body.set('look', look.trim());
      if (companions.trim()) body.set('companions', companions.trim());
      if (isGift && giftFrom.trim()) body.set('gift_from', giftFrom.trim());
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
    <div
      onKeyDown={onKeyDown}
      style={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(20px, 4vw, 40px) clamp(18px, 4vw, 32px)',
      }}
    >
      <ProgressBar step={stepIndex + 1} total={totalSteps} />

      <div style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center', paddingTop: 'clamp(20px, 5vw, 48px)' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>
          {current?.render()}
          {error && (
            <div
              role="alert"
              style={{
                marginTop: 'var(--space-4)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--oxblood)',
                background: 'var(--oxblood-wash)',
                color: 'var(--oxblood-text)',
                fontSize: 15,
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>

      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-4)',
          maxWidth: 640,
          width: '100%',
          margin: '0 auto',
          paddingTop: 'clamp(24px, 5vw, 48px)',
        }}
      >
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0 || submitting}
          style={{
            padding: '12px 22px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--pill-edge)',
            background: 'transparent',
            color: stepIndex === 0 ? 'var(--ink-faint)' : 'var(--ink-soft)',
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            cursor: stepIndex === 0 ? 'default' : 'pointer',
          }}
        >
          ← Back
        </button>

        <span style={{ color: 'var(--ink-faint)', fontSize: 13 }}>
          {current?.hint ?? ''}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={submitting}
          aria-busy={submitting}
          style={{
            padding: '14px 28px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--oxblood)',
            background: 'var(--oxblood)',
            color: 'var(--on-oxblood, #f7f0e0)',
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            fontWeight: 500,
            cursor: submitting ? 'wait' : 'pointer',
            minWidth: 140,
          }}
        >
          {submitting ? 'Sending…' : isLast ? 'Send to the studio' : 'Continue →'}
        </button>
      </nav>
    </div>
  );
}

// --- Step card ------------------------------------------------------------

function StepCard({
  eyebrow,
  question,
  body,
  children,
}: {
  eyebrow: string;
  question: string;
  body?: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <span
        style={{
          fontFamily: 'var(--font-sc, var(--font-body))',
          fontSize: 12,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
        }}
      >
        {eyebrow}
      </span>
      <h1
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 5vw, 38px)',
          lineHeight: 1.15,
          color: 'var(--ink)',
          fontWeight: 400,
        }}
      >
        {question}
      </h1>
      {body && (
        <p
          style={{
            margin: 0,
            color: 'var(--ink-soft)',
            fontSize: 'clamp(16px, 2vw, 18px)',
            lineHeight: 1.55,
            maxWidth: 560,
          }}
        >
          {body}
        </p>
      )}
      {children && <div style={{ marginTop: 'var(--space-2)', display: 'grid', gap: 'var(--space-3)' }}>{children}</div>}
    </div>
  );
}

// --- Progress bar ---------------------------------------------------------

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ display: 'grid', gap: 6, maxWidth: 640, width: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-faint)', fontSize: 12, fontFamily: 'var(--font-sc, var(--font-body))', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        <span>Question {step} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div
        style={{
          height: 3,
          borderRadius: 3,
          background: 'rgba(138, 113, 86, 0.18)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'var(--oxblood)',
            transition: 'width 260ms ease-out',
          }}
        />
      </div>
    </div>
  );
}

// --- Age slider -----------------------------------------------------------

function ageToBand(age: number): '3–4' | '5–6' | '7–8' | '9+' {
  if (age < 5) return '3–4';
  if (age < 7) return '5–6';
  if (age < 9) return '7–8';
  return '9+';
}

function ageToReadingHint(age: number): string {
  if (age < 4) return 'lap-reading · lots of pictures, few words per page';
  if (age < 6) return 'early reader · picture-book pacing, growing sentences';
  if (age < 8) return 'confident reader · full picture book, chapter-like flow';
  return 'independent reader · early chapter-book territory';
}

function formatAge(age: number): string {
  if (Number.isInteger(age)) return `${age} years old`;
  return `${age} years old`;
}

function AgeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const min = 2;
  const max = 10;
  const step = 0.5;

  return (
    <div style={{ display: 'grid', gap: 16, paddingTop: 8 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--ink)', lineHeight: 1 }}>
          {formatAge(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lf-intake-slider"
        aria-label="Age in years"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-faint)', fontSize: 12 }}>
        <span>2</span>
        <span>4</span>
        <span>6</span>
        <span>8</span>
        <span>10</span>
      </div>
      <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 15, fontStyle: 'italic' }}>
        {ageToReadingHint(value)}
      </p>
    </div>
  );
}

// --- Combobox (autocomplete) ---------------------------------------------

function Combobox({
  value,
  onChange,
  suggestions,
  max,
  placeholder,
  ...rest
}: {
  value: string[];
  onChange: (v: string[]) => void;
  suggestions: string[];
  max: number;
  placeholder?: string;
  'aria-label'?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    const taken = new Set(value.map((v) => v.toLowerCase()));
    const base = suggestions.filter((s) => !taken.has(s.toLowerCase()));
    if (!q) return base.slice(0, 8);
    const matches = base.filter((s) => s.toLowerCase().includes(q));
    return matches.slice(0, 8);
  }, [suggestions, value, q]);

  const canAddCustom =
    q.length > 0 &&
    !filtered.some((s) => s.toLowerCase() === q) &&
    !value.some((v) => v.toLowerCase() === q);

  useEffect(() => {
    setHighlight(0);
  }, [q]);

  function add(v: string) {
    const clean = v.trim();
    if (!clean) return;
    if (value.length >= max) return;
    if (value.some((x) => x.toLowerCase() === clean.toLowerCase())) return;
    onChange([...value, clean]);
    setQuery('');
    inputRef.current?.focus();
  }

  function remove(v: string) {
    onChange(value.filter((x) => x !== v));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !query && value.length > 0) {
      e.preventDefault();
      const last = value[value.length - 1];
      if (last) remove(last);
      return;
    }
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const total = filtered.length + (canAddCustom ? 1 : 0);
      if (total > 0) setHighlight((highlight + 1) % total);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const total = filtered.length + (canAddCustom ? 1 : 0);
      if (total > 0) setHighlight((highlight - 1 + total) % total);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const pick = filtered[highlight];
      if (pick) {
        add(pick);
      } else if (canAddCustom) {
        add(query);
      }
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const atMax = value.length >= max;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {value.map((v) => (
            <span
              key={v}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--oxblood)',
                background: 'var(--oxblood-wash)',
                color: 'var(--oxblood-text)',
                fontSize: 15,
              }}
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                aria-label={`Remove ${v}`}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--oxblood-text)',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={atMax ? `Max ${max} chosen` : placeholder}
          disabled={atMax}
          aria-label={rest['aria-label']}
          className="lf-intake-input"
          autoFocus
        />
        {open && !atMax && (filtered.length > 0 || canAddCustom) && (
          <ul
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 10,
              margin: 0,
              padding: 6,
              listStyle: 'none',
              background: 'var(--paper-warm)',
              border: '1px solid var(--pill-edge)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 24px rgba(28,19,14,0.16)',
              maxHeight: 260,
              overflowY: 'auto',
            }}
          >
            {filtered.map((s, i) => (
              <li
                key={s}
                role="option"
                aria-selected={i === highlight}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(s);
                }}
                onMouseEnter={() => setHighlight(i)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: i === highlight ? 'var(--oxblood-wash)' : 'transparent',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                {s}
              </li>
            ))}
            {canAddCustom && (
              <li
                role="option"
                aria-selected={highlight === filtered.length}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(query);
                }}
                onMouseEnter={() => setHighlight(filtered.length)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: highlight === filtered.length ? 'var(--oxblood-wash)' : 'transparent',
                  color: 'var(--ink-soft)',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontStyle: 'italic',
                }}
              >
                Add &ldquo;{query.trim()}&rdquo;
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- MoreDetail: expandable "anything more?" field ------------------------

function MoreDetail({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(value.length > 0);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          justifySelf: 'start',
          padding: '8px 0',
          border: 'none',
          background: 'transparent',
          color: 'var(--ink-soft)',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          textDecoration: 'underline',
          textDecorationColor: 'rgba(138, 113, 86, 0.5)',
          cursor: 'pointer',
        }}
      >
        Add a specific note
      </button>
    );
  }
  return (
    <textarea
      className="lf-intake-input lf-intake-textarea"
      rows={2}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="More detail"
    />
  );
}

// --- Review row -----------------------------------------------------------

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: 12,
        padding: '12px 0',
        borderBottom: '1px solid rgba(138, 113, 86, 0.16)',
        alignItems: 'baseline',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sc, var(--font-body))',
          fontSize: 12,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
        }}
      >
        {label}
      </span>
      <span style={{ color: 'var(--ink)', fontSize: 16, lineHeight: 1.5 }}>{children}</span>
    </li>
  );
}

'use client';

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

export function IntakeForm() {
  const [name, setName] = useState('');
  const [age, setAge] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [traits, setTraits] = useState<string[]>([]);
  const [inspirations, setInspirations] = useState('');
  const [look, setLook] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const kid = name.trim() || 'your child';

  function toggle(list: string[], set: (v: string[]) => void, value: string, max: number) {
    if (list.includes(value)) set(list.filter((v) => v !== value));
    else if (list.length < max) set([...list, value]);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log({ name, age, interests, traits, inspirations, look, photo: Boolean(photo) });
      }}
      style={{ maxWidth: 660, margin: '0 auto', display: 'grid', gap: 'var(--space-8)' }}
    >
      <header style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <span className="lf-eyebrow">A book written for one child</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-size)', margin: 0, color: 'var(--ink)' }}>
          Tell us about your child.
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 'var(--text-body-size)', lineHeight: 1.6 }}>
          About five minutes. We send style previews within 24 hours — you approve
          the look before we build the book.
        </p>
      </header>

      <Field label="What's their name?" help="This is how they'll appear in the book. Nicknames welcome.">
        <input
          className="lf-input"
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
              const f = e.target.files?.[0];
              if (f) setPhoto(URL.createObjectURL(f));
            }}
          />
          {photo ? (
            <span className="lf-upload-done">
              <img src={photo} alt="" className="lf-upload-thumb" />
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

      <button type="submit" className="lf-submit">
        Send this to the studio
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

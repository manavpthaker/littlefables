'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  AgeSlider,
  ChoiceGrid,
  Combobox,
  MoreDetail,
  ProgressBar,
  Row,
  StepCard,
  ageToBand,
} from './intake-ui';


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

/**
 * Which half of the form a step belongs to.
 *
 * 'gate'  — who is buying and what for. Asked first because both change what
 *           gets asked afterwards.
 * 'need'  — the minimum to write and draw the book. Ends in a handoff screen
 *           with a real submit, so a buyer who stops there has still left a
 *           buildable brief.
 * 'more'  — makes the book better, explicitly skippable.
 *
 * The split is to SEQUENCE, not to shorten. gtm-decision.md puts fulfilment at
 * 2.2–4.3 attended hours in configuration A with no paid spend, so the shop is
 * capacity-constrained, not conversion-constrained: a thinner intake does not
 * delete work, it moves it to Manav as extra preview rounds, which is the exact
 * number gating whether ads can run at all.
 */
/**
 * The order the buyer walks through. Gate first because those answers change
 * what gets asked; then everything needed to build the book, ending at the
 * handoff; then the optional half; review last.
 *
 * Two things deliberately sit in 'need' despite feeling like enrichment:
 *   · sticky-moment — it is the story's spine and gates `pnpm content:add`.
 *   · avoid — a dog on page four for a child bitten in June is not a revision
 *     round, it is a refund and a review.
 */
const STEP_ORDER = [
  'welcome',
  'relationship',
  'occasion',
  'occasion-note',
  'occasion-harder',
  'email',
  'etsy',
  'name',
  'pronunciation',
  'pronouns',
  'age',
  'look',
  'sticky-moment',
  'companions',
  'avoid',
  'needed-by',
  'handoff',
  'interests',
  'traits',
  'inspirations',
  'hoped-lesson',
  'lastname',
  'gift',
  'review',
];

const OCCASION_LABEL: Record<string, string> = {
  christmas: 'Christmas',
  birthday: 'A birthday',
  'new-sibling': 'A new baby coming',
  'starting-school': 'Starting school',
  'just-because': 'Just because',
  harder: 'Something harder — we will write first',
};

const OCCASION_Q: Record<string, string> = {
  christmas: 'Do you want Christmas in the story, or is it just when they open it?',
  birthday: 'Which birthday is it, and how are they feeling about getting bigger?',
  'new-sibling': "What's the baby's name, and when do they arrive?",
  'starting-school': "Which school, and what's the bit they're chewing on?",
};

const OCCASION_PH: Record<string, string> = {
  christmas: 'e.g. Christmas morning gift, but the story can be about anything.',
  birthday: 'e.g. Turning five. Very proud, slightly nervous about the big class.',
  'new-sibling': 'e.g. Baby Otis, due in March. She says she wants to hold him.',
  'starting-school': 'e.g. Starts reception in September. Worried about lunch.',
};

type Section = 'gate' | 'need' | 'more';

interface Step {
  key: string;
  render: () => React.ReactNode;
  isValid: () => boolean;
  hint?: string;
  /** Defaults to 'need' — the safe side if someone forgets to tag a new step. */
  section?: Section;
}

export function IntakeForm(props: IntakeFormProps) {
  const router = useRouter();
  const hasToken = Boolean(props.token);

  const [buyerEmail, setBuyerEmail] = useState(props.buyerEmail ?? '');
  const [etsyOrder, setEtsyOrder] = useState(props.etsyOrder ?? '');
  const [lastname, setLastname] = useState('');
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
  const [stickyMoment, setStickyMoment] = useState('');
  const [hopedLesson, setHopedLesson] = useState('');
  const [relationship, setRelationship] = useState('');
  const [occasion, setOccasion] = useState('');
  const [occasionNote, setOccasionNote] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [avoid, setAvoid] = useState('');
  const [neededBy, setNeededBy] = useState('');
  const [wantsMore, setWantsMore] = useState(false);
  const [isGift, setIsGift] = useState(props.isGift ?? false);
  const [giftFrom, setGiftFrom] = useState(props.giftFrom ?? '');

  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kid = name.trim() || 'your child';
  // Whether the buyer has daily access to the child. sticky_moment is the
  // story's spine (authoring-doctrine.md matches it to a pattern, and a book
  // with no matched pattern fails `pnpm content:add`) — so it cannot be
  // optional. But a grandparent buying for a grandchild they see monthly
  // cannot answer "what's been sticky lately", and answers with interests
  // instead, which is the "highlight reel dressed as a story" the doctrine
  // warns about. Same field, same downstream match; a question they can
  // actually answer with authority.
  const isCloseIn = relationship !== 'grandparent' && relationship !== 'other';
  const greeting = props.buyerName?.trim().split(/\s+/)[0];

  // --- Steps ---------------------------------------------------------------

  const steps: Step[] = useMemo(() => {
    const s: Step[] = [];

    s.push({
      key: 'welcome',
      section: 'gate',
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
      section: 'need',
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
      section: 'need',
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
      section: 'need',
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
      key: 'lastname',
      section: 'more',
      isValid: () => true,
      hint: 'Optional — for organizing your book files',
      render: () => (
        <StepCard
          eyebrow="Your family name"
          question="What surname should we file this under?"
          body="We label each family's books by surname (Patel, Okafor, Kim-Tanaka). Skip if you'd rather not share — we'll pick a label from your child's name."
        >
          <input
            className="lf-intake-input"
            autoFocus
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            placeholder="Patel"
            aria-label="Family surname"
            autoComplete="family-name"
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'age',
      section: 'need',
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
      section: 'more',
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
      section: 'more',
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
      section: 'more',
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
      section: 'need',
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
                  <em>kept until your book arrives &mdash; then you choose</em>
                </span>
              </span>
            ) : (
              <span className="lf-intake-upload-empty">
                <span className="lf-intake-upload-plus" aria-hidden>+</span>
                <span>
                  <strong>Add a photo</strong>
                  <em>optional &middot; a drawing reference, never published</em>
                </span>
              </span>
            )}
          </label>
          <p className="lf-intake-consent">
            We use it as a drawing reference &mdash; by us, and by the
            illustration tools we draw in. It is never published, never sold,
            and never shared beyond making {kid}&rsquo;s book. We keep it until
            your book arrives, then ask whether to keep it on file for a future
            book or delete it. <strong>If you don&rsquo;t reply, we delete it.</strong>{' '}
            <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--oxblood-text)' }}>
              How we handle your data
            </a>
          </p>
        </StepCard>
      ),
    });

    s.push({
      key: 'sticky-moment',
      section: 'need',
      isValid: () => stickyMoment.trim().length > 0,
      hint: 'This shapes the whole story',
      render: () => (
        <StepCard
          eyebrow={isCloseIn ? `What ${kid} is working on right now` : `What you see in ${kid}`}
          question={
            isCloseIn
              ? `What's ONE thing that's been sticky for ${kid} lately?`
              : `What have you noticed about ${kid} that you'd want them to know you see?`
          }
          body={
            isCloseIn
              ? `A bedtime struggle, big feelings, a new sibling, screen transitions, fear of the dark, sharing, adjusting to school — whatever comes up most days. The book that helps is the book that meets your child where they actually are. One sentence is enough.`
              : `Something you've watched them do, or become, or try. You don't need to know what they're struggling with this week — you know something better, which is how they look from a little further back. The noticing is the story.`
          }
        >
          <textarea
            className="lf-intake-input lf-intake-textarea"
            autoFocus
            rows={3}
            value={stickyMoment}
            onChange={(e) => setStickyMoment(e.target.value)}
            placeholder={
              isCloseIn
                ? `e.g. Big feelings when it's time to leave the playground. Hitting when overwhelmed. Won't go to sleep without one of us in the room.`
                : `e.g. She checks on the smallest kid in the room without being asked. He'd rather do a hard thing slowly than an easy thing fast.`
            }
            aria-label="Sticky moment"
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'hoped-lesson',
      section: 'more',
      isValid: () => true,
      hint: 'Optional — helps us pick the tool the book teaches',
      render: () => (
        <StepCard
          eyebrow={`What ${kid} might carry forward`}
          question={`What's one thing you hope ${kid} learns from this book?`}
          body={`Not a lecture — a phrase, a tool, a memory. Something you'd love to be able to say later ("remember what the moose taught us?") when the sticky moment shows up again. Skip if you're not sure; I'll pick a fit from what you've told me.`}
        >
          <textarea
            className="lf-intake-input lf-intake-textarea"
            autoFocus
            rows={3}
            value={hopedLesson}
            onChange={(e) => setHopedLesson(e.target.value)}
            placeholder={`e.g. That big feelings pass and don't make him bad. That going to bed doesn't mean love goes away. That she can be brave and scared at the same time.`}
            aria-label="Hoped lesson"
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'companions',
      section: 'need',
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
      section: 'more',
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
      key: 'relationship',
      section: 'gate',
      isValid: () => relationship.length > 0,
      hint: 'This changes what we ask next',
      render: () => (
        <StepCard
          eyebrow="First, so we ask the right things"
          question={`Who are you to ${name.trim() || 'them'}?`}
          body="A parent knows what this week has been like. A grandparent knows something else, and we'd rather ask you that than ask you to guess."
        >
          <ChoiceGrid
            value={relationship}
            onChange={setRelationship}
            options={[
              { value: 'parent', label: 'Their parent' },
              { value: 'grandparent', label: 'Their grandparent' },
              { value: 'other', label: 'Someone else who loves them' },
            ]}
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'occasion',
      section: 'gate',
      isValid: () => occasion.length > 0,
      render: () => (
        <StepCard
          eyebrow="What it's for"
          question="Is this book for an occasion?"
          body="It changes the shape of the story, not just the card that comes with it."
        >
          <ChoiceGrid
            value={occasion}
            onChange={setOccasion}
            options={[
              { value: 'christmas', label: 'Christmas' },
              { value: 'birthday', label: 'A birthday' },
              { value: 'new-sibling', label: 'A new baby coming' },
              { value: 'starting-school', label: 'Starting school' },
              { value: 'just-because', label: 'No occasion — just because' },
              { value: 'harder', label: 'Something harder' },
            ]}
          />
        </StepCard>
      ),
    });

    if (occasion === 'harder') {
      s.push({
        key: 'occasion-harder',
        section: 'gate',
        isValid: () => true,
        render: () => (
          <StepCard
            eyebrow="Let's do this one properly"
            question="We'd rather talk to you first."
            body="Books about grief, adoption, illness, or a family changing shape are the ones that matter most, and they're the ones a form is worst at. Finish the rest of this and we'll read it, then write to you before we start — or message us on Etsy now if you'd rather begin there."
          >
            <textarea
              className="lf-intake-input lf-intake-textarea"
              autoFocus
              rows={3}
              value={occasionNote}
              onChange={(e) => setOccasionNote(e.target.value)}
              placeholder="Only as much as you want to put in writing."
              aria-label="What's going on"
            />
          </StepCard>
        ),
      });
    } else if (occasion && occasion !== 'just-because') {
      s.push({
        key: 'occasion-note',
        section: 'gate',
        isValid: () => true,
        render: () => (
          <StepCard
            eyebrow="A little more about the occasion"
            question={OCCASION_Q[occasion] ?? 'Anything we should know about it?'}
            body="Optional, but it's usually the detail that makes them believe the book was written for them."
          >
            <textarea
              className="lf-intake-input lf-intake-textarea"
              autoFocus
              rows={3}
              value={occasionNote}
              onChange={(e) => setOccasionNote(e.target.value)}
              placeholder={OCCASION_PH[occasion] ?? ''}
              aria-label="About the occasion"
            />
          </StepCard>
        ),
      });
    }

    s.push({
      key: 'pronunciation',
      section: 'need',
      isValid: () => true,
      render: () => (
        <StepCard
          eyebrow="So we say it right"
          question={`How do you say ${name.trim() || 'their name'}?`}
          body="Every book is narrated aloud. Write it how it sounds — this is the one mistake we can't hear for you."
        >
          <input
            className="lf-intake-input"
            autoFocus
            value={pronunciation}
            onChange={(e) => setPronunciation(e.target.value)}
            placeholder="e.g. SEE-oh-ban · rhymes with Maya · like the month"
            aria-label="Name pronunciation"
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'pronouns',
      section: 'need',
      isValid: () => pronouns.length > 0,
      render: () => (
        <StepCard
          eyebrow="In the story"
          question={`How should we refer to ${kid}?`}
        >
          <ChoiceGrid
            value={pronouns}
            onChange={setPronouns}
            options={[
              { value: 'she/her', label: 'She' },
              { value: 'he/him', label: 'He' },
              { value: 'they/them', label: 'They' },
            ]}
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'avoid',
      section: 'need',
      isValid: () => true,
      render: () => (
        <StepCard
          eyebrow="Worth knowing"
          question="Anything we should steer clear of?"
          body="A frightening animal, a recent loss, a person who shouldn't appear, a subject that's raw right now. We'd rather know than find out from your face when you read it."
        >
          <textarea
            className="lf-intake-input lf-intake-textarea"
            autoFocus
            rows={2}
            value={avoid}
            onChange={(e) => setAvoid(e.target.value)}
            placeholder="e.g. No dogs — she was bitten in June. Don't mention Grandpa."
            aria-label="Things to avoid"
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'needed-by',
      section: 'need',
      isValid: () => true,
      render: () => (
        <StepCard
          eyebrow="Timing"
          question="Is there a date it has to land by?"
          body="Previews come back within 24 hours and the finished book 3–4 days after you approve them. If it's tighter than that, tell us now and we'll say straight away whether we can do it."
        >
          <input
            className="lf-intake-input"
            type="date"
            autoFocus
            value={neededBy}
            onChange={(e) => setNeededBy(e.target.value)}
            aria-label="Needed by"
            style={{ maxWidth: 260 }}
          />
        </StepCard>
      ),
    });

    s.push({
      key: 'handoff',
      section: 'need',
      isValid: () => true,
      render: () => (
        <StepCard
          eyebrow="That's everything we need"
          question={`We can start ${kid}'s book from here.`}
          body="A few more questions make it sound more like them — favourite things, how they come across, picture books you love the look of. Two minutes, and you can stop at any point."
        >
          <button
            type="button"
            onClick={() => {
              setWantsMore(true);
              setStepIndex((i) => i + 1);
            }}
            style={{
              justifySelf: 'start',
              padding: '12px 20px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid color-mix(in srgb, var(--ink) 28%, transparent)',
              background: 'transparent',
              color: 'var(--ink)',
              font: '600 15px/1 var(--font-body)',
              cursor: 'pointer',
            }}
          >
            Tell you more first &rarr;
          </button>
        </StepCard>
      ),
    });

    s.push({
      key: 'review',
      section: 'more',
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
            <Row label="Said as">{pronunciation || '—'}</Row>
            <Row label="Referred to as">{pronouns || '—'}</Row>
            {occasion && <Row label="Occasion">{OCCASION_LABEL[occasion] ?? occasion}</Row>}
            {neededBy && <Row label="Needed by">{neededBy}</Row>}
            {avoid.trim() && <Row label="Steer clear of">{avoid}</Row>}
            <Row label={isCloseIn ? 'Sticky' : 'What you notice'}>{stickyMoment || '—'}</Row>
            {hopedLesson && <Row label="Hoped lesson">{hopedLesson}</Row>}
            {isGift && giftFrom && <Row label="Gift from">{giftFrom}</Row>}
            <Row label="Sent to">{buyerEmail || props.buyerEmail || '—'}</Row>
          </ul>
        </StepCard>
      ),
    });

    // Sort into the canonical order, then by section. Push order above is
    // whatever was convenient; this is what the buyer walks through.
    const rank = (st: Step) => {
      const i = STEP_ORDER.indexOf(st.key);
      return i === -1 ? STEP_ORDER.length : i;
    };
    return [...s].sort((a, b) => rank(a) - rank(b));
  }, [
    hasToken, greeting, buyerEmail, etsyOrder, lastname, name, age, ageTouched, kid,
    interests, interestsNote, traits, traitsNote, inspirations, look,
    photoFile, photoPreview, companions, stickyMoment, hopedLesson,
    isGift, giftFrom, props.isGift, props.buyerEmail,
    relationship, occasion, occasionNote, pronunciation, pronouns, avoid,
    neededBy, isCloseIn,
  ]);

  // Until the buyer opts into the optional half, the progress bar should count
  // to the handoff — not to a total they have not agreed to walk.
  const handoffIdx = steps.findIndex((st) => st.key === 'handoff');
  const totalSteps = !wantsMore && handoffIdx !== -1 ? handoffIdx + 1 : steps.length;
  const current: Step | undefined = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  function goNext() {
    setError(null);
    if (!current || !current.isValid()) {
      setError('This one needs an answer to continue.');
      return;
    }
    // The handoff is a real submit point: everything needed to build the book
    // has been asked, so a buyer who stops here has still left a buildable
    // brief. Continuing past it is opt-in, via the button inside the card.
    if (isLast || (current.key === 'handoff' && !wantsMore)) {
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
      if (lastname.trim()) body.set('parent_lastname', lastname.trim());
      body.set('age_years', String(age));
      body.set('age_band', ageToBand(age));
      interests.forEach((v) => body.append('interests', v));
      traits.forEach((v) => body.append('traits', v));
      if (interestsNote.trim()) body.set('interests_note', interestsNote.trim());
      if (traitsNote.trim()) body.set('traits_note', traitsNote.trim());
      if (inspirations.trim()) body.set('inspirations', inspirations.trim());
      if (look.trim()) body.set('look', look.trim());
      if (companions.trim()) body.set('companions', companions.trim());
      if (stickyMoment.trim()) body.set('sticky_moment', stickyMoment.trim());
      if (hopedLesson.trim()) body.set('hoped_lesson', hopedLesson.trim());
      if (relationship) body.set('relationship', relationship);
      if (occasion) body.set('occasion', occasion);
      if (occasionNote.trim()) body.set('occasion_note', occasionNote.trim());
      if (pronunciation.trim()) body.set('name_pronunciation', pronunciation.trim());
      if (pronouns) body.set('pronouns', pronouns);
      if (avoid.trim()) body.set('avoid', avoid.trim());
      if (neededBy) body.set('needed_by', neededBy);
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
          {submitting
            ? 'Sending…'
            : isLast || (current?.key === 'handoff' && !wantsMore)
              ? 'Send to the studio'
              : 'Continue →'}
        </button>
      </nav>
    </div>
  );
}

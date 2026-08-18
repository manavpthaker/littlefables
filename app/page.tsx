import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Wordmark } from '@ds/components/core/Wordmark.jsx';
import { TrustRow } from '@ds/components/outward/TrustRow.jsx';
import { BuyerFooter } from '@ds/components/outward/BuyerFooter.jsx';
import { Ornament } from '@ds/components/core/Ornament.jsx';
import { getParentSession } from '@/lib/server/parent-session';
import { CoverBuilder } from './landing/cover-builder';
import { FullFilmRow, StepLoop } from './landing/how-loops';

// Bare-domain landing. Rendered for anyone hitting `/` — no auto-redirect,
// ever. The reader entry is /f/<token> (soon /read/<slug>-<token>) and
// /gift/<code>; a parent who wants to manage settings clicks "Parent
// sign-in" and OTPs into /login. See docs/commerce/delivery-flow.md.
//
// Design mirrors the Claude Design handoff at
// /tmp/lf-landing-ds/etsy-landing-page-design (kept as reference, not
// committed to the repo). The interactive cover builder is a client
// component; every other section is server-rendered.

const ETSY_SHOP = 'https://www.etsy.com/shop/LittleFablesStories';
const PRICE_LINE = '$69';

function utm(base: string, campaign: string): string {
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}utm_source=littlefables&utm_campaign=${campaign}`;
}

export const metadata: Metadata = {
  title: 'Little Fables — stories made around a child’s real life',
  description:
    'A quiet story written, illustrated, and narrated around a child’s real life—or a small group’s shared place, project, and questions.',
  openGraph: {
    title: 'Little Fables — stories made around a child’s real life',
    description:
      'A quiet story written, illustrated, and narrated around a child’s real life—or a small group’s shared place, project, and questions.',
    images: ['/landing/og-cover.jpg'],
    type: 'website',
  },
};

// The four steps double as loop captions: each step's copy carries the words,
// and its loop carries the motion. So the order and headings follow the film's
// beats — intake, previews, making, arrival — rather than the older "write,
// approve, deliver" framing.
const HOW_STEPS = [
  {
    label: 'step one',
    heading: 'Tell us about your kid',
    body:
      'After checkout, a short intake asks their name, age, and the things they love — the dog, the pond, the yellow boots.',
    video: '/landing/motion/loop-step-1.mp4',
    poster: '/landing/motion/loop-step-1-poster.png',
    alt: 'A short intake page in an iPad frame, a child’s name being typed.',
  },
  {
    label: 'step two',
    heading: 'Previews in 24 hours',
    body:
      'You pick a style at intake. Within a day we send the sketch, then the colour rough, then the finished scene. Nothing is finalized until you say yes.',
    video: '/landing/motion/loop-step-2.mp4',
    poster: '/landing/motion/loop-step-2-poster.png',
    alt: 'Three revision panels: a graphite sketch, a colour rough, a finished night scene.',
  },
  {
    label: 'step three',
    heading: 'We write, paint, narrate',
    body:
      'Your kid becomes the main character. The story bends around what they love and what they’re working through. Every page is painted and read aloud in a warm voice — never generated, never rushed.',
    video: '/landing/motion/loop-step-3.mp4',
    poster: '/landing/motion/loop-step-3-poster.jpg',
    alt: 'A page of the book developing from a desaturated wash to a finished painted scene, then the cover binding.',
  },
  {
    label: 'step four',
    heading: 'It arrives on their iPad',
    body:
      'We send a link the moment their book is ready. Open it once, save it to the home screen, and it lives on their iPad like a favourite app.',
    video: '/landing/motion/loop-step-4.mp4',
    poster: '/landing/motion/loop-step-4-poster.png',
    alt: 'The delivery email in an iPad frame, then the book opening in the reader.',
    /** The funnel line under this step — links into the /sample route. */
    funnel: 'or just read one →',
  },
] as const;

const FAQS = [
  {
    q: 'Can a story be made from a class or co-op project?',
    a: 'That is an early pilot we are exploring: one real project, place, or season of learning, with adult approval before delivery. Children do not need to be named or photographed. If you lead a small learning community, write to us and tell us what the children are doing together.',
  },
  {
    q: 'How long until it’s delivered?',
    a: 'Days, not weeks. We message you the moment their book is ready, with the link and simple saving instructions.',
  },
  {
    q: 'What ages is it written for?',
    a: 'Ages three to nine. The story length, vocabulary, and pacing are tuned to the age you give us at intake.',
  },
  {
    q: 'How do I save the book to their home screen?',
    a: 'On an iPad or iPhone in Safari, tap the share button and choose Add to Home Screen. On Android, tap the browser menu and choose Add to Home Screen. Two taps total. Once it’s there, it opens like an app.',
  },
  {
    q: 'What device does it need?',
    a: 'Any iPad, tablet, or phone. The book opens in the browser and saves to the home screen like an app — no app store, no account, no download.',
  },
  {
    q: 'Do I choose the art style?',
    a: 'Yes. You pick a style at intake, and you approve the look of the illustrations before we finish the book.',
  },
  {
    q: 'Can I see the illustrations before the book is final?',
    a: 'Yes. You pick the style at intake, and we send the art for your approval before we finish. If it doesn’t feel right, we rework it.',
  },
  {
    q: 'What happens to my child’s information?',
    a: 'We use it only to make the book. When it’s delivered we send you a link to delete your child’s photo or keep it on file for a second book — if you don’t reply, we delete it.',
  },
  {
    q: 'Can I gift it without spoiling the surprise?',
    a: 'Yes. Every order includes a printable certificate with the child’s name, so there’s something to hand over while the book is being made.',
  },
  {
    q: 'What if we don’t love it?',
    a: 'Just write to us and we’ll rework it until it feels right. Every book is made by hand — we’d rather fix it than leave it.',
  },
];

const TRUST = [
  {
    heading: 'You decide what we keep',
    body:
      'Once your book is delivered you choose — delete your child’s photo, or keep it on file for a second book. No reply means we delete it.',
  },
  {
    heading: 'Nothing pulls at them',
    body:
      'No ads. No algorithm. No autoplay. The book ends, and that’s the end — just twenty quiet minutes.',
  },
  {
    heading: 'Theirs to keep',
    body:
      'The book doesn’t expire and doesn’t need an account. It stays on the home screen like a book stays on a shelf.',
  },
];

const INCLUDED_LIST = [
  'A story written for your child, chapter by chapter',
  'Illustrations in the style you chose, look approved by you',
  'Warm read-aloud narration on every page',
  'Delivered as an app saved to their iPad home screen',
  'A printable gift certificate while it’s being made',
];

const FOOTER_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Write to us', href: utm(ETSY_SHOP, 'contact') },
  { label: 'Privacy', href: '#trust' },
  { label: 'Etsy shop', href: utm(ETSY_SHOP, 'footer') },
];

export default async function LandingPage() {
  // If a parent is already signed in, swap the "Parent sign-in" link for
  // a direct handoff into the parent surface. Cache()-wrapped, cheap.
  const session = await getParentSession();
  const navHref = utm(ETSY_SHOP, 'nav');
  const heroHref = utm(ETSY_SHOP, 'hero');
  const aboutHref = utm(ETSY_SHOP, 'about');
  const giftHref = utm(ETSY_SHOP, 'gift');
  const includedHref = utm(ETSY_SHOP, 'included');
  const contactHref = utm(ETSY_SHOP, 'contact');

  return (
    <div
      className="lf-page-main"
      data-density="outward"
      style={{ background: 'var(--paper)', minHeight: '100vh' }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'var(--paper)',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <Wordmark markSize={36} />
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              flexWrap: 'wrap',
            }}
          >
            {['about', 'how it works', 'questions'].map((label, i) => {
              const href = ['#about', '#how', '#faq'][i]!;
              return (
                <a
                  key={label}
                  href={href}
                  style={{
                    fontFamily: 'var(--font-sc)',
                    fontSize: 'var(--text-label-size)',
                    letterSpacing: 'var(--track-label)',
                    color: 'var(--ink-soft)',
                    textDecoration: 'none',
                  }}
                >
                  {label}
                </a>
              );
            })}
            <a
              className="lf-btn lf-btn--primary lf-btn--compact"
              href={navHref}
              style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Start your book
            </a>
          </nav>
        </div>
      </header>

      <section style={{ borderBottom: '1px solid var(--border-soft)' }}>
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '96px 24px 88px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 64,
          }}
        >
          <div
            style={{
              flex: '1 1 480px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              alignItems: 'flex-start',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sc)',
                fontSize: 'var(--text-label-size)',
                letterSpacing: 'var(--track-label)',
                color: 'var(--brass)',
              }}
            >
              a book written for one child
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-display-size)',
                lineHeight: 'var(--text-display-lh)',
                margin: 0,
                maxWidth: '11em',
                textWrap: 'pretty' as React.CSSProperties['textWrap'],
              }}
            >
              Your kid, in their own storybook.
            </h1>
            <p
              style={{
                fontSize: 'calc(var(--text-body-size)*1.12)',
                lineHeight: 1.55,
                color: 'var(--ink-soft)',
                maxWidth: '30em',
                margin: 0,
                textWrap: 'pretty' as React.CSSProperties['textWrap'],
              }}
            >
              Written for who they are, illustrated in a style you helped choose, and read aloud in a
              warm voice. Delivered in days, saved to their iPad like a favorite app.
            </p>
            <p
              style={{
                color: 'var(--ink-soft)',
                maxWidth: '30em',
                margin: 0,
                lineHeight: 'var(--text-body-lh)',
              }}
            >
              A story can be made for one child at home—or around the place, project, and questions
              a small group shared together.
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
                marginTop: 8,
              }}
            >
              <a
                className="lf-btn lf-btn--primary lf-btn--hero"
                href={heroHref}
                style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                Start your book
              </a>
              <a
                className="lf-btn lf-btn--secondary"
                href="/sample"
                title="Read The Lantern of Round Pond — a Little Fables reader demo"
                aria-label="Read The Lantern of Round Pond, a Little Fables reader demo"
                style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                Read the demo story
              </a>
            </div>
            <p
              style={{
                fontSize: 'var(--text-caption-size)',
                color: 'var(--ink-faint)',
                margin: '4px 0 0',
              }}
            >
              Small studio. One book at a time.
            </p>
          </div>
          <figure
            style={{
              flex: '0 0 auto',
              width: 'min(320px, 80vw)',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              className="lf-cover-frame"
              style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5' }}>
                <Image
                  src="/landing/hero-cover.jpg"
                  alt="Cover art: a girl in a red coat and yellow boots at the edge of a pond"
                  fill
                  sizes="(max-width: 640px) 80vw, 320px"
                  priority
                  style={{ objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div
                style={{
                  padding: '20px 28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-sc)',
                    fontSize: 12,
                    letterSpacing: '0.14em',
                    color: 'var(--brass)',
                  }}
                >
                  little fables
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.2 }}>
                  For Ada —
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontStyle: 'italic',
                    fontSize: 16,
                    lineHeight: 1.5,
                    color: 'var(--ink-soft)',
                    maxWidth: '14em',
                  }}
                >
                  a story of the pond and the yellow boots.
                </span>
                <div style={{ width: 44, borderTop: '1px solid var(--gilt)', marginTop: 2 }} />
              </div>
            </div>
            <figcaption
              style={{
                textAlign: 'center',
                fontFamily: 'var(--font-sc)',
                fontSize: 14,
                letterSpacing: '0.08em',
                color: 'var(--ink-faint)',
              }}
            >
              sample cover · your child’s name in the title
            </figcaption>
          </figure>
        </div>
        <TrustRow />
      </section>

      <section id="how" style={{ padding: '72px 24px 64px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <span
            style={{
              fontFamily: 'var(--font-sc)',
              fontSize: 'var(--text-label-size)',
              letterSpacing: 'var(--track-label)',
              color: 'var(--brass)',
            }}
          >
            from your first note to their bedtime
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-title-size)',
              lineHeight: 'var(--text-title-lh)',
              margin: '10px 0 32px',
            }}
          >
            How your book is made
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 32,
            }}
          >
            {HOW_STEPS.map((s) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <StepLoop src={s.video} poster={s.poster} alt={s.alt} />
                <span
                  style={{
                    fontFamily: 'var(--font-sc)',
                    fontSize: 'var(--text-label-size)',
                    letterSpacing: 'var(--track-label)',
                    color: 'var(--ink-faint)',
                  }}
                >
                  {s.label}
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: 0 }}>
                  {s.heading}
                </h3>
                <p style={{ margin: 0, color: 'var(--ink-soft)', lineHeight: 'var(--text-body-lh)' }}>
                  {s.body}
                </p>
                {'funnel' in s && s.funnel ? (
                  <Link
                    href="/sample"
                    style={{
                      marginTop: 2,
                      fontFamily: 'var(--font-sc)',
                      fontSize: 14,
                      letterSpacing: '0.1em',
                      color: 'var(--oxblood)',
                      textDecoration: 'none',
                    }}
                  >
                    {s.funnel}
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
          {/* The high-intent minority who want the film get it, quietly, after
              the loops have done the mass-appeal job. Audio and controls are
              on because the click is opt-in. */}
          <div
            style={{
              marginTop: 40,
              paddingTop: 20,
              borderTop: '1px solid var(--border-soft)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <FullFilmRow
              src="/landing/motion/walkthrough.mp4"
              poster="/landing/motion/walkthrough-poster.png"
            />
          </div>
        </div>
      </section>

      <section
        id="cover"
        style={{
          background: 'var(--paper-warm)',
          borderTop: '1px solid var(--border-soft)',
          borderBottom: '1px solid var(--border-soft)',
          padding: '64px 24px 60px',
        }}
      >
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <span
            style={{
              fontFamily: 'var(--font-sc)',
              fontSize: 'var(--text-label-size)',
              letterSpacing: 'var(--track-label)',
              color: 'var(--brass)',
            }}
          >
            six worlds to choose from
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-title-size)',
              lineHeight: 'var(--text-title-lh)',
              margin: '10px 0 8px',
            }}
          >
            Every book is illustrated to order
          </h2>
          <p
            style={{
              margin: '0 0 36px',
              color: 'var(--ink-soft)',
              maxWidth: '38em',
              lineHeight: 'var(--text-body-lh)',
            }}
          >
            We make every book by hand in the style you choose. Pick a world, type their name, and
            watch a cover come together — take a screenshot, or start the real book when you’re
            ready.
          </p>
          <CoverBuilder startBookUrl={ETSY_SHOP} />
          <p
            style={{
              textAlign: 'center',
              fontSize: 'var(--text-caption-size)',
              color: 'var(--ink-faint)',
              margin: '40px 0 0',
            }}
          >
            You’ll pick the final style and story details when you order. This is just a preview.
          </p>
        </div>
      </section>

      <section id="about" style={{ padding: '64px 24px 0' }}>
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 48,
            alignItems: 'center',
          }}
        >
          <figure
            style={{
              flex: '0 1 340px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              className="lf-cover-frame lf-cover-frame--photo"
              style={{ width: 'min(320px, 80vw)', padding: 14, margin: '0 auto' }}
            >
              <Image
                src="/landing/maker-swing.jpg"
                alt="A father and his son on the swings at the playground, holding hands"
                width={600}
                height={750}
                style={{
                  width: '100%',
                  aspectRatio: '4/5',
                  objectFit: 'cover',
                  display: 'block',
                  border: '1px solid var(--border-card)',
                }}
              />
            </div>
          </figure>
          <div
            style={{
              flex: '1 1 420px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sc)',
                fontSize: 'var(--text-label-size)',
                letterSpacing: 'var(--track-label)',
                color: 'var(--brass)',
              }}
            >
              why we started
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-title-size)',
                lineHeight: 'var(--text-title-lh)',
                margin: 0,
                textWrap: 'pretty' as React.CSSProperties['textWrap'],
              }}
            >
              Kids listen differently when the story is about them.
            </h2>
            <p style={aboutP}>
              My son was three when I first noticed it. He was struggling with the kind of big
              feelings that make an afternoon fall apart over the wrong-colored cup. Nothing I said
              helped. So one night I made up a story where a boy with his name — and his dog, and
              the pond behind our house — met an old moose who taught him a small secret about big
              feelings. He held onto that secret for weeks.
            </p>
            <p style={aboutP}>
              It wasn’t the moose. It was that he was in the story. He wasn’t being told what to
              do; he was watching himself figure it out. When a kid hears their own name in a story,
              their brain treats it a little like memory. The lesson doesn’t feel like a lesson — it
              feels like something they already knew about themselves.
            </p>
            <div
              style={{
                background: 'var(--brass-wash)',
                border: '1px solid var(--border-card)',
                borderRadius: 8,
                padding: '14px 18px',
                maxWidth: '32em',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-sc)',
                  fontSize: 13,
                  letterSpacing: '0.1em',
                  color: 'var(--brass)',
                }}
              >
                why this works
              </span>
              <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.55 }}>
                A child can meet a difficult feeling or a new idea more safely when it arrives inside
                a story. The story gives them room to notice, wonder, and recognize something in
                themselves.
              </p>
            </div>
            <p style={aboutP}>
              Little Fables is that idea, made simpler. You tell us who your child is — their name,
              their age, what they love, what they’re working through. We write, illustrate, and
              narrate a book just for them. It arrives in days and lives on their iPad like a book
              lives on a shelf. Every story bends around your kid, quietly, the way the first one
              did.
            </p>
            <p style={aboutP}>
              The same idea can hold a shared learning life: the place a group keeps returning to,
              the project they built, the questions they asked, or the season they spent together.
              We are exploring that version carefully, one adult-approved pilot at a time.
            </p>
            <div style={{ marginTop: 6 }}>
              <a
                className="lf-btn lf-btn--secondary"
                href={aboutHref}
                style={{ textDecoration: 'none' }}
              >
                Start your book
              </a>
            </div>
          </div>
        </div>
        <Ornament kind="rule-and-dot" style={{ width: 220, margin: '64px auto 0' }} />
      </section>

      <section id="app" style={{ padding: '64px 24px 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <span
            style={{
              fontFamily: 'var(--font-sc)',
              fontSize: 'var(--text-label-size)',
              letterSpacing: 'var(--track-label)',
              color: 'var(--brass)',
            }}
          >
            not a pdf — a quiet little app
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-title-size)',
              lineHeight: 'var(--text-title-lh)',
              margin: '10px 0 8px',
            }}
          >
            It reads like a book. It works like a book.
          </h2>
          <p
            style={{
              margin: '0 0 28px',
              color: 'var(--ink-soft)',
              maxWidth: '36em',
              lineHeight: 'var(--text-body-lh)',
            }}
          >
            A warm voice reads along as words light up. No ads, no algorithm, no autoplay — just
            their book. Two modes, one for the day and one for bedtime.
          </p>
          <p
            style={{
              margin: '-12px 0 28px',
              color: 'var(--ink-soft)',
              maxWidth: '36em',
              lineHeight: 'var(--text-body-lh)',
            }}
          >
            “The Lantern of Round Pond” is a demo of the reader. A Little Fables story can follow
            one child, a family, or a small group’s real learning life.
          </p>
          <div
            style={{
              display: 'grid',
              // Cap the cell width so on very wide screens the mockups don't
              // stretch to hundreds of extra pixels and dominate the layout.
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 460px))',
              justifyContent: 'center',
              gap: 32,
            }}
          >
            {[
              {
                src: '/landing/reader-day.jpg',
                alt: 'iPad showing Day mode: an illustrated page beside storybook text, with a narrator bar',
                caption:
                  'day mode — illustrated pages, a warm read-aloud narrator. tap a word to hear it.',
              },
              {
                src: '/landing/reader-night.jpg',
                alt: 'iPad showing Night mode: text-only page on a dark warm background with a small transport bar',
                caption:
                  'night mode — text-only pages and a sleepy voice at bedtime. the book knows which one to open.',
              },
            ].map((f) => (
              <figure key={f.src} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    border: '1px solid var(--border-card)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-card)',
                    background: 'var(--paper-warm)',
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '4 / 3',
                  }}
                >
                  <Image
                    src={f.src}
                    alt={f.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 460px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <figcaption
                  style={{
                    fontFamily: 'var(--font-sc)',
                    fontSize: 14,
                    letterSpacing: '0.08em',
                    color: 'var(--ink-soft)',
                    textAlign: 'center',
                    maxWidth: '30em',
                    margin: '0 auto',
                  }}
                >
                  {f.caption}
                </figcaption>
              </figure>
            ))}
          </div>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--ink-soft)',
              margin: '28px 0 0',
              lineHeight: 'var(--text-body-lh)',
            }}
          >
            It saves to the home screen. It doesn’t expire. It doesn’t ask for an account.
          </p>
          <Ornament kind="rule-and-dot" style={{ width: 220, margin: '64px auto 0' }} />
        </div>
      </section>

      <section id="gift" style={{ padding: '64px 24px 0' }}>
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 48,
            alignItems: 'center',
          }}
        >
          <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span
              style={{
                fontFamily: 'var(--font-sc)',
                fontSize: 'var(--text-label-size)',
                letterSpacing: 'var(--track-label)',
                color: 'var(--brass)',
              }}
            >
              most of our books are gifts
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-title-size)',
                lineHeight: 'var(--text-title-lh)',
                margin: 0,
              }}
            >
              A present that arrives before the book does
            </h2>
            <p style={{ ...aboutP, maxWidth: '32em' }}>
              Grandparents are our best customers. Order from anywhere, and we include a printable
              certificate to hand over on the day — birthdays, a new sibling, the first day of
              school — while the book is being made.
            </p>
            <p style={{ ...aboutP, maxWidth: '32em' }}>
              You don’t need to know their iPad from their tablet. The grown-up on the receiving end
              gets a link that simply opens.
            </p>
            <div style={{ marginTop: 6 }}>
              <a className="lf-btn lf-btn--secondary" href={giftHref} style={{ textDecoration: 'none' }}>
                Gift a book
              </a>
            </div>
            <p style={{ ...aboutP, maxWidth: '32em', margin: '4px 0 0' }}>
              Have a class, co-op, or microschool project worth remembering?{' '}
              <a href="mailto:hello@littlefables.app?subject=Learning community pilot">
                Tell us about it →
              </a>
            </p>
          </div>
          <figure
            style={{
              flex: '1 1 380px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              className="lf-cover-frame"
              style={{
                width: 'min(300px, 78vw)',
                aspectRatio: '4/5',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px 30px',
                boxSizing: 'border-box',
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-sc)',
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  color: 'var(--brass)',
                }}
              >
                little fables
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 30, lineHeight: 1.2 }}>
                For Rosa —
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'italic',
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: 'var(--ink-soft)',
                  maxWidth: '14em',
                }}
              >
                a story being written just for her, from Grandma June.
              </span>
              <div style={{ width: 44, borderTop: '1px solid var(--gilt)', margin: '6px 0 2px' }} />
              <span
                style={{
                  fontFamily: 'var(--font-sc)',
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  color: 'var(--ink-faint)',
                }}
              >
                certificate LF-2041 · august 2026
              </span>
            </div>
            <figcaption
              style={{
                textAlign: 'center',
                fontFamily: 'var(--font-sc)',
                fontSize: 14,
                letterSpacing: '0.08em',
                color: 'var(--ink-faint)',
                maxWidth: '28em',
              }}
            >
              The certificate to hand over on the day, while the book is being made.
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="trust" style={{ padding: '72px 24px 0' }}>
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            background: 'var(--forest-wash)',
            border: '1px solid var(--border-card)',
            borderRadius: 16,
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sc)',
              fontSize: 'var(--text-label-size)',
              letterSpacing: 'var(--track-label)',
              color: 'var(--forest)',
            }}
          >
            the quiet parts
          </span>
          <p
            style={{
              margin: '-8px 0 0',
              color: 'var(--ink-soft)',
              lineHeight: 'var(--text-body-lh)',
            }}
          >
            How we handle your child’s info, and what the book won’t do.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 24,
            }}
          >
            {TRUST.map((t) => (
              <div key={t.heading} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0 }}>
                  {t.heading}
                </h3>
                <p style={{ margin: 0, color: 'var(--ink-soft)', lineHeight: 'var(--text-body-lh)' }}>
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="included" style={{ padding: '72px 24px 0' }}>
        <p
          style={{
            maxWidth: 760,
            margin: '0 auto 20px',
            textAlign: 'center',
            fontFamily: 'var(--font-sc)',
            fontSize: 'var(--text-label-size)',
            letterSpacing: 'var(--track-label)',
            color: 'var(--ink-faint)',
          }}
        >
          Written, illustrated, and narrated in a small studio — one book at a time.
        </p>
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
            background: 'var(--paper-warm)',
            border: '1px solid var(--ink-faint)',
            padding: '40px 36px 44px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
            textAlign: 'center',
          }}
        >
          <Wordmark layout="mark-only" markSize={46} />
          <span
            style={{
              fontFamily: 'var(--font-sc)',
              fontSize: 'var(--text-label-size)',
              letterSpacing: 'var(--track-label)',
              color: 'var(--brass)',
            }}
          >
            one book, made once
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-title-size)',
              lineHeight: 'var(--text-title-lh)',
              margin: 0,
            }}
          >
            What you get
          </h2>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              color: 'var(--ink-soft)',
              fontSize: 'calc(var(--text-body-size)*1.05)',
              lineHeight: 1.5,
            }}
          >
            {INCLUDED_LIST.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p
            style={{
              margin: '6px 0 0',
              fontFamily: 'var(--font-sc)',
              fontSize: 15,
              letterSpacing: '0.08em',
              color: 'var(--ink-faint)',
            }}
          >
            {PRICE_LINE}
          </p>
          <a
            className="lf-btn lf-btn--primary lf-btn--hero"
            href={includedHref}
            style={{ textDecoration: 'none' }}
          >
            Start your book
          </a>
        </div>
      </section>

      <section id="faq" style={{ padding: '72px 24px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Ornament kind="fleuron" size={28} />
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-title-size)',
              lineHeight: 'var(--text-title-lh)',
              margin: '0 0 20px',
              textAlign: 'center',
            }}
          >
            Questions, answered
          </h2>
          {FAQS.map((f) => (
            <details
              key={f.q}
              style={{ borderTop: '1px solid var(--border-ornament)', padding: '16px 4px' }}
            >
              <summary
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: 'var(--ink)',
                }}
              >
                {f.q}
              </summary>
              <p
                style={{
                  margin: '12px 0 0',
                  color: 'var(--ink-soft)',
                  lineHeight: 'var(--text-body-lh)',
                  maxWidth: '38em',
                }}
              >
                {f.a}
              </p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid var(--border-ornament)' }} />
          <p style={{ textAlign: 'center', color: 'var(--ink-soft)', margin: '28px 0 0' }}>
            Something else? <a href={contactHref}>Write to us</a> — we answer quickly.
          </p>
        </div>
      </section>

      <BuyerFooter links={FOOTER_LINKS} />

      <div
        className="lf-sticky-cta"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          background: 'var(--paper)',
          borderTop: '1px solid var(--border-soft)',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px calc(10px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: 'var(--font-sc)',
            fontSize: 14,
            letterSpacing: '0.08em',
            color: 'var(--ink-soft)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Little Fables · custom storybook
        </span>
        <a
          className="lf-btn lf-btn--primary"
          href={utm(ETSY_SHOP, 'sticky')}
          style={{ textDecoration: 'none', flex: '0 0 auto' }}
        >
          Start your book
        </a>
      </div>

      {/* Small footer link back into the app for parents. Text changes based
          on whether we already have a session for this browser. */}
      <div
        style={{
          padding: '18px 24px 32px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Link
          href={session ? '/parent' : '/login'}
          style={{
            color: 'var(--ink-faint)',
            textDecoration: 'none',
            fontFamily: 'var(--font-sc)',
            fontSize: 13,
            letterSpacing: '0.08em',
          }}
        >
          {session ? `Continue as ${session.parentEmail} →` : 'Parent sign-in'}
        </Link>
      </div>
    </div>
  );
}

const aboutP: React.CSSProperties = {
  margin: 0,
  color: 'var(--ink-soft)',
  lineHeight: 'var(--text-body-lh)',
  maxWidth: '32em',
};

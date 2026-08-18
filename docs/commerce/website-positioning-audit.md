# Little Fables Website Positioning Audit

**URL:** https://littlefables.app  
**Date:** 2026-08-18  
**Scope:** public landing page, metadata, sample-story path, and the message a microschool/co-op leader would encounter after an outreach email  
**Primary question:** does the current site make schools feel welcome without weakening the existing family/gift position?

## Executive summary

The site is warm, specific, and unusually human in the “Why we started” section. It explains the real origin of the product—one parent making a story for his son—and the reader experience is clear. It is not institutionally off-putting.

The problem is sequencing. In the first five seconds, the site presents Little Fables as a one-child, parent-purchased iPad gift: “Your kid, in their own storybook,” “Start your book,” delivery in days, and a later section titled “most of our books are gifts.” A microschool or co-op leader can understand the quality, but has to infer that stories can also belong to a class, a place, a project, or a shared learning experience.

This does not call for a complete repositioning. Keep the child-first, personal origin and the family/gift route. Add one audience-neutral bridge near the hero and make the “why” section do more work: personalized storytelling helps a child see themselves in a story, and the same mechanism can preserve a group’s real learning life.

## 5-second test

| Question | Score | Evidence |
|---|---:|---|
| What does it do? | 5/5 | A written, illustrated, narrated storybook delivered as a reader. |
| Who is it for? | 2/5 | “Your kid,” “one child,” and “your child” strongly imply a parent or gift buyer. |
| Why care? | 4/5 | The origin story and the promise of a child seeing themselves in the story are compelling. |
| What makes it different? | 3/5 | Custom authorship, narration, approval, and no-distraction reading are clear; the group/project use case is invisible. |
| What should I do next? | 5/5 | “Start your book” and “Read a sample book” are prominent and understandable. |

**Overall: 19/25.** A family visitor is well-served. A school visitor is likely to think “beautiful custom gift,” not “possible learning artifact for our children.”

## What may turn learning communities away

### 1. The hero is too exclusively private-gift oriented

- **Evidence:** metadata says “a storybook made for one child”; the hero says “Your kid, in their own storybook”; delivery is framed around one child’s iPad (`app/page.tsx:30–37`, `265–290`).
- **Impact:** a program leader may assume the product only accepts individual family orders and stop looking for a group fit.
- **Recommendation:** retain the hero, but add one sentence immediately below the subhead: “Made for one child at home—or for a small group whose real project deserves to become a story.”

### 2. “Why we started” is the strongest bridge, but it arrives too late

- **Evidence:** the most authentic copy is several sections below the hero: “Kids listen differently when the story is about them,” followed by the story about Az (`app/page.tsx:615–665`).
- **Impact:** school visitors may never reach the section that explains the emotional and learning rationale.
- **Recommendation:** pull a two-sentence version of the Az origin into the hero or the first section, then retain the longer version below.

### 3. Learning language currently risks overclaiming and underserving educators

- **Evidence:** the “why this works” box says personalized stories “boost engagement and comprehension” and references “narrative therapy research” (`app/page.tsx:651–657`).
- **Impact:** this can sound like an educational or therapeutic claim that a school must scrutinize, while still not explaining how a teacher or co-op leader would use the story.
- **Recommendation:** use narrower language: “A child can meet a difficult feeling or new idea more safely when it arrives inside a story.” Add a separate “for learning communities” explanation based on project documentation, vocabulary, discussion, and reflection—not outcomes claims.

### 4. The gift section dominates the category frame

- **Evidence:** “most of our books are gifts,” “Grandparents are our best customers,” and “Gift a book” (`app/page.tsx:809–832`).
- **Impact:** this is useful for the current commerce funnel but reinforces that the site is not for a school, co-op, or microschool.
- **Recommendation:** keep the section, but label it “For families and gifts” and add a parallel, lower-friction link: “For a class, co-op, or learning group.” That link can lead to a lightweight inquiry page or mailto, not a new product funnel yet.

### 5. The current demo proves the reader, not the group use case

- **Evidence:** the sample CTA is described as “a real book we made for one kid” (`app/page.tsx:310–315`), and the product explanation centers one child.
- **Impact:** outreach recipients can understand the technology but cannot visualize a class story, field guide, service-project book, or group-owned artifact.
- **Recommendation:** keep “The Lantern of Round Pond” as the product demo. Add a one-line caption: “The same reader can hold a story about a child, a place, or a project shared by a small group.” Do not fabricate a school case study before one exists.

## Recommended positioning adjustment

Do not replace the current position. Add a second valid context:

> **Little Fables makes quiet, illustrated stories around the real lives of children.** At home, that can mean a story about one child. For a small learning community, it can mean a story about the place, project, or questions the children shared.

This preserves the emotional core of the Az story while making the school/co-op use case legible. It also avoids calling the product “curriculum” before there is evidence that educators want a curriculum product.

## Smallest safe changes

1. Add the audience-neutral bridge under the hero subhead.
2. Add “for families, classrooms, and small learning communities” to the first explanatory section.
3. Add a “For learning communities” link beside the gift CTA; route it to a short inquiry page or email while the offer is still being validated.
4. Change the sample caption from “one kid” to “one child” and add the group-use explanation without implying existing school customers.
5. Replace the “why this works” evidence box with careful, non-therapeutic language unless the research citations and claims are ready to publish.
6. Add a short FAQ: “Can a story be made from a class or co-op project?” Answer: “That is an early pilot we are exploring; one project, adult approval, no child photos required.”

## Ready-to-use copy

**Hero bridge:**

> A story can be made for one child at home—or around the place, project, and questions a small group shared together.

**Learning-community link:**

> Have a class, co-op, or microschool project worth remembering? Tell us about it →

**Sample caption:**

> “The Lantern of Round Pond” is a demo of the reader. A Little Fables story can follow one child, a family, or a small group’s real learning life.

**Az-origin bridge:**

> I started Little Fables for my son Az: a story worked because he was not being told what to do—he was watching himself figure something out. That is still the heart of it, whether the story follows one child or a group’s shared experience.

## Codex prompt for the first implementation pass

```text
Update app/page.tsx without redesigning the page or changing the Etsy purchase funnel. Keep the current family/gift positioning and the existing Az origin story. Add a concise audience-neutral bridge below the hero paragraph explaining that Little Fables can be made for one child at home or around a small group’s shared place, project, and questions. Add a secondary “For a class, co-op, or learning group” link near the gift section that points to a lightweight inquiry route (use the existing contact pattern; do not invent a new checkout flow). Update the sample-book caption so “The Lantern of Round Pond” is clearly a reader demo, not a school case study. Avoid educational, therapeutic, comprehension, or outcome claims unless already supported by an existing cited source. Run pnpm typecheck and pnpm lint after the change.
```

## Bottom line

The website should not be hidden from the schools. It should be made slightly more legible to them. The emotional center—“a child sees themselves in a story”—is exactly the bridge to learning communities. The current site buries that bridge beneath a strong gift funnel; the recommended fix is a small second doorway, not a new identity.

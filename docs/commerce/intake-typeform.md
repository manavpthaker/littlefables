# Buyer Intake — Typeform

18 screens, conversational mode. About 5 minutes to complete.

Linked from the Etsy instant-download welcome PDF and the order confirmation.

## Build settings

- **Mode**: Conversational (one question per screen)
- **Theme**: warm neutral background (cream, not white), serif question titles
- **Progress bar**: enabled, plain style
- **Recall**: set `{name}` on screen 2, reference throughout
- **Redirect on completion**: `littlefables.app/thanks/{response_id}`
- **Webhook**: POST to fulfillment inbox
- **Payment**: none — Etsy handles payment, Typeform is intake only

## Question pattern

Where it fits, use the three-part structure: **Observation** (context) → **Question**
(the ask) → **Why I'm asking** (small italic note framing the data as strategic, not
nosy). This lives in Typeform's description field.

---

### 1 · Welcome (statement)

**Title:** Let's make your kid a book.

**Description:**
> In about 5 minutes, you'll tell us who your kid is and what kind of story you want.
> We'll send back 2–4 style previews within 24 hours — you approve the one you love,
> and the final book lands 3–4 days later.
>
> Don't love the previews? Unlimited revisions, or your money back. Promise.

**Button:** Yes, let's start →

---

### 2 · Name

**Title:** First things first — what's your kid's name?
**Description:** This is how they'll appear in the book. Nicknames welcome.
**Input:** Short text, required

---

### 3 · Age

**Title:** How old is `{name}`?
**Description:** We'll match the reading level, sentence rhythm, and page count to
their age. Not sure? Pick the closest — we can adjust in the previews.
**Input:** Multiple choice, required · `3–4` `5–6` `7–8` `9+`

---

### 4 · Pronouns

**Title:** Any pronouns we should use for `{name}`?
**Description:** Skip if you'd rather we infer from the name — we'll get it right most
of the time.
**Input:** Multiple choice, skippable · `she / her` `he / him` `they / them`

---

### 5 · Interests

**Title:** What does `{name}` love?
**Description:** Pick up to 3, or type your own. We're not looking for a personality
profile — just what makes them light up.
**Input:** Multiple choice, multi-select max 3, **Other** enabled

**Options (30):**
> dinosaurs · space · horses · soccer · dance · pirates · dragons · building things ·
> animals · princesses · robots · ocean · magic · music · art · trains · trucks ·
> bugs · superheroes · unicorns · dogs · cats · cooking · gardening · science ·
> bikes · ballet · football · painting · fairies

**Why I'm asking:** *These become the world of the story — what they see, what they meet.*

---

### 6 · Descriptive words

**Title:** Pick two words a grown-up would use to describe `{name}`.
**Description:** These become the seeds for our main character. Type your own if none
of these fit.
**Input:** Multiple choice, multi-select exactly 2, **Other** enabled

**Options (30):**
> brave · curious · funny · kind · stubborn · shy · wild · thoughtful · bossy ·
> gentle · silly · careful · loud · quiet · dramatic · cuddly · adventurous ·
> sensitive · energetic · patient · quirky · determined · sweet · bold · sneaky ·
> dreamy · mischievous · cheerful · chatty · serious

**Why I'm asking:** *How your character feels on the page — brave characters take on
dragons; gentle ones save butterflies.*

---

### 7 · Occasion

**Title:** What's this story for?
**Description:** Pick the one that fits best. You'll get a chance to tell us more in a
moment.
**Input:** Multiple choice, single-select

- Birthday adventure
- Bedtime story
- Christmas or holiday special
- New sibling story
- Big feelings (scared, angry, jealous, missing someone)
- Helping them with something
- Just a story about them

---

### 8 · Help-with *(conditional: shown if 7 = "Helping them with something")*

**Title:** What are we helping `{name}` with?
**Description:** A few sentences is plenty. The more specific, the better we can write it.
**Placeholder examples:**
> "Sharing with baby brother." · "Starting kindergarten." · "Not being scared of the
> dark." · "Missing Grandma who moved."
**Input:** Long text, skippable

---

### 9 · Anything else about the story

**Title:** Anything else you'd like in the story?
**Description:** Optional. A memory, a favorite place, an in-joke, a lesson you're
hoping lands — anything. Skip if not.
**Input:** Long text, skippable

**Why I'm asking:** *Little details are what make a story feel theirs.*

---

### 10 · Cast

**Title:** Anyone else should be in the story?
**Description:** Up to 2 people or pets. We'll weave them in naturally — no crowd
scenes, promise.
**Input:** Two paired-entry blocks, both optional

Each block: Name (short text) + Relationship (multiple choice: Mom, Dad, Grandma,
Grandpa, Sister, Brother, Best friend, Cousin, Aunt, Uncle, Dog, Cat, Other pet)

---

### 11 · Art inspirations

**Title:** Now for the look — what illustrators or picture books do you love?
**Description:** Type 2–3 references. Books, illustrators, art styles you've saved on
Pinterest. We generate the previews from *your* taste, not a canned dropdown of five.
**Placeholder examples:**
> "The Snowy Day by Ezra Jack Keats" · "Oliver Jeffers style" · "Julia Denos
> watercolor" · "Cozy Beatrix Potter feel" · "Not sure — we'll pick a style that fits
> their age and the occasion"
**Input:** Long text, required

**Why I'm asking:** *This is what makes your book not-AI-slop. Your references, our
craft, one preview you actually love.*

---

### 12 · What `{name}` looks like

**Title:** Tell us what `{name}` looks like.
**Description:** Freely — hair, skin, favorite outfit, anything they always carry,
missing teeth, glasses, quirks. The more specific, the better. Or upload a photo below.
**Placeholder:**
> "Curly brown hair, brown skin, always in his blue dinosaur shirt, missing his front
> tooth."
**Input:** Long text, required + optional file upload (photo, max 5MB)

**Why I'm asking:** *Not a fixed template of five skin tones and three hairstyles. We
render `{name}` as `{name}` — actually.*

> **Note:** file upload requires Typeform Pro. Photos are reference-only, stored in a
> gitignored folder, deleted with the rest of the intake unless the buyer opts in.

---

### 13 · Is this a gift?

**Title:** Is this a gift for someone else?
**Description:** If yes, we'll make you a beautiful printable gift certificate. You
buy, they redeem the link.
**Input:** Multiple choice · `Yes` `No`

---

### 14 · Gift recipient *(conditional: shown if 13 = "Yes")*

**Title:** Tell us about the recipient.
**Description:** We'll send them a redemption link when the book is ready. You'll get
the printable certificate right away.
**Input:** Three fields on one screen

- Recipient parent's email (email, required)
- Gift date, if any (date picker, skippable)
- A short note for the certificate (short text, ≤200 chars, skippable)

---

### 15 · Delivery

**Title:** Where should we send the previews?
**Description:** You'll get an email in ~24 hours with 2–4 style-and-character
previews. Pick the one you love — or ask us to iterate.
**Input:** Two fields

- Email (email, required)
- Phone (short text, skippable — *"In case we have a quick question. We won't spam you."*)

---

### 16 · Deadline

**Title:** Any specific date you need this by?
**Description:** Birthday, gift date, first day of school. Skip if not urgent.
**Input:** Date picker, skippable

---

### 17 · Save profile

**Title:** One last thing.
**Description:**
> We delete your intake once your book is delivered. Not saved. Not stored. Not used
> to train anything.
>
> But — if you'd like your next book to be one click and half price ($17 instead of
> $29), we can hold onto `{name}`'s profile until you're ready. You can delete it
> anytime. Your call.

**Input:** Yes/No, **default No**
- Yes, save `{name}`'s profile for future books
- No, delete everything when the book is delivered

---

### 18 · Confirmation (statement)

**Title:** That's it. We're on it.

**Description:**
> You'll get an email within 24 hours with your style-and-character previews. Pick the
> one you love — or ask us to iterate as many times as it takes to get it right.
>
> Final book lands 3–4 days after you approve.
>
> Don't love the previews, even after we've tried? Full refund, no questions asked.
>
> Thanks for trusting us with `{name}`'s first book.
> — Little Fables

**Button:** Done

---

## Field mapping to the art skill

The `fable-art-custom` ChatGPT skill reads these fields by name:

| Typeform screen | JSON field | Used for |
|---|---|---|
| 5 · Interests | `interests[]` | Story world, scene subjects |
| 6 · Descriptive words | `traits[]` | Character personality, story arc |
| 3 · Age | `age` | Visual complexity, vocabulary, page count |
| 7 · Occasion | `occasion` | Mood, palette warmth |
| 8 · Help-with | `help_with` | Emotional arc |
| 11 · Art inspirations | `art_inspirations` | **Style anchor generation** |
| 12 · Character description | `character_description` | Character block |
| 12 · Photo | `reference_photo` | Optional likeness reference |
| 10 · Cast | `cast[]` | Supporting character blocks |

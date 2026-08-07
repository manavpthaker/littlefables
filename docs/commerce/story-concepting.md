# Story Concepting

How to get a real story out of ten data points. Sits between [`intake-flow.md`](intake-flow.md)
and the `fable` skill — the intake collects, this decides what the story *is*, and
`fable` formats the draft.

## The failure mode this prevents

Given a name, two adjectives and three interests, the obvious move is to satisfy
them all:

> Maya was brave and curious. Maya loved dinosaurs, space, and horses. One day Maya
> rode a horse into space and met a dinosaur.

Every field is used. Nothing is a story. This is what a competitor's $7.99 tier
produces, and it's what a buyer paying $59 will recognise instantly as generated.

## The engine

**The struggle is the plot. The loves are the props. The traits are the voice. The
cast are witnesses, not solvers.**

| Intake field | Job in the story | Never |
|---|---|---|
| `help_with` / `occasion` | The **problem** — what the story is actually about | Decoration |
| `traits[]` (exactly 2) | The **cause** of the problem and the **voice** on the page | A compliment |
| `interests[]` (up to 3) | The **world** and the **metaphor material** | The plot |
| `cast[]` | Witness, foil, or the one who names the problem | The one who solves it |
| `age` | Structure, page count, kind of resolution | — |
| appearance | Art direction only | Anything to do with plot |

### The trait inversion — the move that does the work

The intake asks for two words a grown-up would use. Those are given as compliments.
**Turn one of them into a cost.** Every strength taken far enough is the thing in
the way:

| Trait | Its cost |
|---|---|
| brave | reckless — doesn't stop to look |
| curious | wanders off, misses what's in front of them |
| kind | can't say no, gives away what they needed |
| careful | never starts |
| stubborn | won't ask for help |
| shy | the thing they want passes them by |
| funny | jokes instead of saying the true thing |
| gentle | can't hold their ground |
| bossy | ends up alone |
| dreamy | forgets the thing that mattered |
| determined | can't tell when to stop |
| sensitive | feels everything, including what isn't theirs |

The story is then: **the trait that defines them is also what's in their way, and by
the end they've learned to use it rather than be used by it.** That's a genuine
character arc and it's derivable mechanically from two adjectives.

This is why "Rosa was not a patient girl, **and she knew it**" works. The second
clause is what makes her a character rather than a description.

### The metaphor bridge

Take the abstract problem and find one concrete object from their interests that can
carry it. This is the generative move — the interests supply *material*, never subject.

| Problem | Interest | The object |
|---|---|---|
| patience | gardening | a bean that won't come up |
| afraid of the dark | space | the dark is where the stars are kept |
| sharing with a new sibling | dinosaurs | two of them, one fossil, one brush |
| starting school | building things | a bridge you have to cross before it's finished |
| missing someone | ocean | a bottle that takes its time |
| jealousy | dance | two dancers, one spotlight that moves |
| can't sit still | bugs | something that only appears if you stop moving |

If you can't find the bridge, the story will be about the interest instead of about
the child. Keep looking.

### One image, three times

Pick a single object and let it recur at least three times — the lantern, the bean,
the bottle. Its meaning should change slightly each time. This is most of what makes
a story feel *authored* rather than assembled, and it costs nothing.

It also gives you the title. *The Lantern of Round Pond.*

## Structure by age

| Age | Shape | Pages |
|---|---|---|
| 3–4 | One problem, one attempt, resolution. A refrain that repeats. | 10–12 |
| 5–6 | Problem → attempt fails → second attempt with a twist → resolution. | 12–14 |
| 7–8 | Problem → failure → **reframe** (they see it differently) → resolution. | 14–18 |
| 9+ | Interior conflict, a subplot, a resolution allowed to stay slightly open. | 18–24 |

Page count is a margin decision as much as a craft one — fewer pages is
proportionally less illustration, which is the expensive stage.

## The rules

1. **The child fails first.** A story where it works the first time isn't a story.
2. **The adult never solves it.** Cast members name the problem, hand over a tool, or
   witness. Grandma June says patience is something you grow. She does not grow it.
3. **Never state the lesson.** If a sentence could be embroidered on a cushion,
   delete it. The buyer's questionnaire said "helping them with patience" — the book
   must never contain the word.
4. **Use one interest, not three.** The other two can be scenery. Cramming all three
   is the clearest tell of a generated story.
5. **The love makes the solution possible.** Not coincidence. Rosa's garden is why
   she has a bean, which is why she has something to wait for.
6. **The specific detail earns its place.** The missing tooth, the blue dinosaur
   shirt, the untied sneaker — one or two, in the art and once in the words. Not a
   catalogue.
7. **End on an image, not a statement.** The last page should be something you can
   see.

## When the intake is thin

The common case: interests and two traits, occasion is "just a story about them,"
`help_with` skipped, "anything else" blank. There is no stated problem.

**Derive the problem from the trait pair.** Two adjectives sitting together already
imply a tension:

| Pair | The story it wants to be |
|---|---|
| brave + sensitive | the cost of being the brave one when you feel everything |
| funny + shy | making people laugh so you don't have to be seen |
| stubborn + kind | wanting to help and refusing to be helped |
| curious + careful | wanting to know and not wanting to risk |
| loud + thoughtful | having more inside than gets said |
| gentle + determined | holding a line without raising your voice |

If the two words don't obviously conflict, use the trait-cost table above on the
stronger one and build the problem from that.

This is also the best possible use of the preview stage: the style previews go out
in 24 hours anyway, so **send the one-line premise with them.** "We're thinking: a
story about a boy who is brave enough for anything except being still." A parent who
reads that and says *yes, that's him* has told you the story is right before you've
written a page — and one who says *actually, it's the opposite* has saved you the
rewrite.

## The concepting pass, in order

Before writing anything:

1. **Name the problem** in one plain sentence. From `help_with`, or derived from the
   trait pair.
2. **Choose the cost** — which trait is in the way, and how.
3. **Find the object** — one thing from their interests that can carry the problem.
4. **Decide who witnesses** — one cast member, and what they say once.
5. **Write the premise in one line.** If it doesn't sound like a book you'd want to
   read, none of the following pages will save it.
6. **Pick the recurring image**, and the title from it.

Six answers. Then draft.

That premise line is also what should go into the Azi-verse project as the brief —
not the raw intake. Handing a model the questionnaire produces trait recitation.
Handing it *"a story about an impatient girl and a bean that won't come up, in which
the grandmother explains and does not help"* produces a story.

## What this is worth

This framework is the part of the product that isn't buyable. The art tools are
commodity, the narration is an API, the reader is a few hundred lines of React.
Anyone can assemble those in a weekend.

The reason a $59 book is worth $59 rather than $7.99 is that someone decided the
story should be about the bean.

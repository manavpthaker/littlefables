One-line: the only action element; primary is always oxblood, one per screen.
```jsx
<Button icon="play" utterance="Let's read your story.">Read tonight's chapter</Button>
<Button variant="secondary">Browse the shelf</Button>
<Button variant="quiet" size="compact">Not now</Button>
```
Variants: primary (oxblood, paper text), secondary (2px ink border), quiet. Sizes hero/standard/compact map to tap-target tokens, so they rescale with data-density. Press settles (inset shadow + 1px drop), never disappears.

Celebration card — blooming medallion + falling watercolor petals (pigments, never foil confetti). Reduced-motion drops the petals and keeps a single glow.
```jsx
<Celebration title="First book finished!" subtitle="Rosa and the River Star" icon="book-open" color="var(--teal)">
  <Button variant="primary" icon="arrow-right" utterance="What's next?">Keep going</Button>
</Celebration>
```

Multiple earns queue — never stack: `<CelebrationQueue items={[{kind:'sun',title:'A new sun!'},{kind:'badge',title:'Word collector!'}]} onEmpty={goHome} />` (order sun → badge → word, 600ms gap).

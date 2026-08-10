Adult-density primitives for Parent Corner (always inside `[data-density="parent"]`): ListRow (tables are stacks of these), Field + TextInput, SectionHeader (the uppercase section label — never hand-roll it), RetellingPlayer (child's tell-it-back audio + transcript).
```jsx
<div data-density="parent">
  <ListRow icon="book-open" title="The Car Wash Dragon" meta="2 chapters · created Tue" trailing={<LifecycleChip status="checking" />} />
  <RetellingPlayer title="Azad retells: Rosa and the River Star" duration="0:42" transcript="Rosa found a lantern and the river was magic…" />
</div>
```

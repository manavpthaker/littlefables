System-state components: StateBanner (offline/syncing/synced/syncfail, kid-warm vs parent-informative), PaintingWash ("painting this page…" shimmer — the only kid loading state), ErrorCharacter (a sleepy bark blob + warm words + a way onward — never a dialog).
```jsx
<StateBanner state="offline" density="kid" />
<PaintingWash />
<ErrorCharacter action={<Button variant="primary" icon="book-open">To the shelf</Button>} />
```

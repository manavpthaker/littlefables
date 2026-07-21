Persistent bottom navigation for the kid app: Home · Library · a quiet Grown-ups door. Fixed to the viewport bottom over a wash capsule with blur; safe-area padded. Active tab = marigold ring + breath (never terracotta — that's action-only). The Grown-ups item uses `quiet` so it reads as a door, not a destination. Hidden inside the reader — the story stays immersive.

```jsx
<TabBar
  activeKey="home"
  onSelect={(key) => router.push(routes[key])}
  items={[
    { key: 'home', icon: 'home', label: 'Home', utterance: 'Home!' },
    { key: 'library', icon: 'library', label: 'Library', utterance: 'Pick a story!' },
    { key: 'parent', icon: 'lock', label: 'Grown-ups', quiet: true },
  ]}
/>
```

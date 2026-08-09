Reader transport controls, always in the bottom-third reach zone, capsule prev/next around a 64px terracotta play.
```jsx
<Transport playing={false} onPlay={toggle} onPrev={prev} onNext={next} canPrev={page>0} />
```
Invariants are behavioral contracts: play/pause never navigates; prev/next never auto-plays (PRD A3).

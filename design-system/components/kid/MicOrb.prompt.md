Voice input orb — the single mic affordance system-wide (ask-the-story, checkpoint answers, "tell me YOUR idea").
```jsx
<MicOrb state="listening" size={72} onTap={stop} />
<MicOrb state="heard" echo="A berry by the door! What a kind idea…" transcript="put a berry by the door" />
```
The `echo` is how a 4-year-old knows he was understood: buddy speech line + italic transcription caption.
States map to the system vocabulary: idle → listening (river, breathing ring, "I'm listening…") → processing (dusk) → heard (sage bloom). Mercy flow: two misses never show red — the orb returns to listening with a butter glow and the buddy offers a hint.

Buddy presence — watercolor-blob avatar whose ring/motion shows the system state (speaking teal bars, listening river breathing ring, thinking dusk dots).
```jsx
<Buddy name="Pip" color="var(--teal)" state="speaking" size={96}
  speech="Good morning, Azad! Want to find out what Rosa saw in the river?" utterance="Good morning, Azad!" />
<Buddy compact size={56} state="listening" />
```
The buddy is the ONLY element that speaks; its state ring is the same vocabulary used by MicButton and StateOrb.

Rule: when `speech` is shown, the utterance is the SAME text verbatim — the bubble is a caption to the voice.

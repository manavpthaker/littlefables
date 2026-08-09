Comprehension checkpoint — the buddy asks a context-specific question in a speech bubble; the child answers by mic or taps options. Conversational, never quiz-styled.
```jsx
<Checkpoint type="inference" question="How do you think Rosa felt when the lantern went out?"
  micState="listening" options={[{label:'Scared'},{label:'Brave'}]} onMic={listen} onPick={pick} />
<Checkpoint type="recall" mercy="hint" hint="Remember the cave? It rhymes with 'stern'…" question="What did Rosa hold up high?" />
<Checkpoint type="recall" mercy="given" given="It was the lantern! You remembered the cave part." onMoveOn={next} question="What did Rosa hold up high?" />
```
Bubble tint encodes question type. Mercy is two-stage: first-miss hint (butter ring, curious) → answer given warmly (settled, his idea celebrated), always with `onMoveOn` so the flow never dead-ends. Checkpoints gate pacing, never access.

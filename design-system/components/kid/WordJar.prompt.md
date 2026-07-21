The Home face of the wordbook: a glass-wash jar holding the most recent kept words as hand-font pills (owned words get the filled star + full ink). The whole jar is one tap target → the Word Book; the count is spoken, never shown as a numeral. Hidden when empty — the first starred word makes it appear.

```jsx
<WordJar
  words={[{ word: 'vast', owned: true }, { word: 'gentle' }, { word: 'burrow' }]}
  count={7}
  utterance="Seven words in your jar!"
  onOpen={() => router.push('/read/words')}
/>
```

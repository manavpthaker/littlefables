Reader page text with the word-highlight treatment and tap-any-word → star-save loop (PRD A9).
```jsx
<StoryText overArt words={"Rosa held the lantern high".split(' ').map(w=>({w}))}
  currentIndex={3} starredWords={['lantern']} onHearWord={speak} onStarWord={save} />
```
Current word = terracotta-wash pill; first tap on a word hears it + arms it (marigold wash + star); a second tap on the SAME word saves it — the whole word capsule is the >=44px star target, the icon is visual-only. Armed state persists until another word tap or page turn. Set `overArt` whenever it sits on art.

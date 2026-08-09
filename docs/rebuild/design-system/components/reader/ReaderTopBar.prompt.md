The reader's persistent top bar (inside the top scrim): capsule back button, WordCapsule landing slot in the center, quiet sync capsule + compact Buddy on the right.
```jsx
<ReaderTopBar onBack={goHome} savedWord="lantern" justSaved syncing buddyState="idle" />
```
Starred words land here (the visible end of the star-save gesture). Offline shows nothing in this bar.

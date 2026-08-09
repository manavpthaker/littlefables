Book cover card + horizontal Shelf rail for the kid home screen.
```jsx
<Shelf label="Your books">
  <BookCard title="Rosa and the River Star" progress={0.4} chapters="3 chapters" />
  <BookCard title="The Car Wash Dragon" status="painting" />
  <BookCard title="Mango Moon" status="new" />
</Shelf>
```
States: default, progress ribbon, `painting` (marigold shimmer + brush icon — art generating), `new` (Gochi Hand badge). No locked/gray state exists.

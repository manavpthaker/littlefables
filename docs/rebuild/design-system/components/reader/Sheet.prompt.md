Paper sheet rising over the bottom of an art page — the sanctioned home for buddy speech + choices (or any interaction) over art, landing everything in the reach zone.
```jsx
<Sheet speech="Which way should Rosa go?">
  <ChoiceBlocks options={[{label:'Follow the light',icon:'sparkles'},{label:'Wait for morning',icon:'sun'}]} onIdea={openMic} />
</Sheet>
```
`ChoiceBlocks sheet` delegates here. Speech is spoken verbatim (buddy turn).

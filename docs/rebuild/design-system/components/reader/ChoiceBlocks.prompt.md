Story choice blocks — two tinted option cards plus the always-last dashed "tell me YOUR idea" mic block (spoken idea becomes `childIdea`).
```jsx
<ChoiceBlocks options={[{label:'Follow the fox', icon:'paw-print'},{label:'Climb the hill', icon:'mountain'}]}
  onPick={pick} onIdea={openMic} />
```
Each option is voiced when it appears; icons carry meaning for non-readers.

On art pages, always `sheet` — a paper sheet rises over the bottom of the page (lands choices in the reach zone; never place bare blocks over art).

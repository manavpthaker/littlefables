import React from 'react';
export function ChoiceBlocks({ choices=[], pickedId, mercyId, onChoose }) {
  return <div className="lf-choices" role="group">
    {choices.map(c=><button key={c.id} type="button" className="lf-choice" data-picked={c.id===pickedId?'true':'false'} data-mercy={c.id===mercyId?'true':'false'} data-utterance={c.utterance||c.label} onClick={()=>onChoose&&onChoose(c.id)}>{c.label}</button>)}
  </div>;
}

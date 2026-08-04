import React from 'react';
import { Celebration } from './Celebration.jsx';
export function CelebrationQueue({ items=[], activeIndex=0, nextLabel, children }) {
  const it=items[activeIndex];
  return <div className="lf-celebqueue">
    {it?<Celebration title={it.title} message={it.message} ceremonial={it.ceremonial} utterance={it.utterance}>{children}</Celebration>:null}
    {items.length>1?<div className="lf-celebqueue-dots" aria-hidden="true">{items.map((_,i)=><span key={i} className="lf-celebqueue-dot" data-active={i===activeIndex?'true':'false'}></span>)}</div>:null}
    {nextLabel?<span className="lf-celebqueue-next">{nextLabel}</span>:null}
  </div>;
}

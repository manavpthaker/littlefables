import React from 'react';
import { Ornament } from '../core/Ornament.jsx';
export function StoryText({ text, currentIndex=-1, overArt, dropcap, onWordTap, utterance }) {
  const words=(text||'').split(/\s+/).filter(Boolean);
  return <p className={'lf-storytext'+(overArt?' lf-storytext--overart':'')} data-utterance={utterance||text}>
    {dropcap&&words.length?<Ornament kind="dropcap" letter={words[0][0]} size={72}/>:null}
    {words.map((w,i)=>{
      const shown=dropcap&&i===0?w.slice(1):w;
      const cls=i===currentIndex?'w w--now':i>currentIndex&&currentIndex>=0?'w w--next':'w';
      return <React.Fragment key={i}><span className={cls} onClick={onWordTap?()=>onWordTap(w,i):undefined}>{shown}</span>{' '}</React.Fragment>;
    })}
  </p>;
}

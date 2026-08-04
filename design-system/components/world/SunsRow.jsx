import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function SunsRow({ total=5, earned=0, label, utterance }) {
  return <span className="lf-sunsrow" data-utterance={utterance} role="img" aria-label={label||earned+' of '+total+' suns'}>
    {Array.from({length:total}).map((_,i)=><span key={i} className="lf-sunsrow-sun" data-earned={i<earned?'true':'false'}><Icon name="motif-sun" size={24}/></span>)}
    {label?<span className="lf-sunsrow-label">{label}</span>:null}
  </span>;
}

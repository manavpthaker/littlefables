import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function ContinueCard({ title, chapterLabel, progress=0, coverSrc, utterance, onContinue }) {
  return <button type="button" className="lf-continue" data-utterance={utterance} onClick={onContinue}>
    <span className="lf-continue-thumb">{coverSrc?<img src={coverSrc} alt=""/>:null}</span>
    <span>
      <span className="lf-continue-eyebrow">{chapterLabel||'keep reading'}</span>
      <span className="lf-continue-title" style={{display:'block'}}>{title}</span>
      <span className="lf-continue-bar"><i style={{width:(progress*100)+'%'}}></i></span>
    </span>
    <Icon name="chevron-right" size={26}/>
  </button>;
}

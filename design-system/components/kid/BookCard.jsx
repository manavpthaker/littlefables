import React from 'react';
import { Ornament } from '../core/Ornament.jsx';
export function BookCard({ title, childName, coverSrc, coverAlt, progress, isNew, utterance, onOpen }) {
  return <button type="button" className="lf-bookcard" data-utterance={utterance} onClick={onOpen}>
    {isNew?<span className="lf-bookcard-ribbon" aria-hidden="true"></span>:null}
    <span className="lf-bookcard-cover">
      {coverSrc?<img src={coverSrc} alt={coverAlt||''}/>:<span className="lf-cover-empty"><Ornament kind="sunburst" size={48} color="var(--ink-faint)"/></span>}
      {progress>0?<span className="lf-bookcard-progress"><i style={{width:(progress*100)+'%'}}></i></span>:null}
    </span>
    <span className="lf-bookcard-title">{title}</span>
    {childName?<span className="lf-bookcard-child">{childName}'s book</span>:null}
  </button>;
}

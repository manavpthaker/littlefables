import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function ChapterMap({ chapters=[], currentId, onSelect }) {
  return <div className="lf-chaptermap" role="list">
    {chapters.map(ch=>{
      const state=ch.done?'done':ch.id===currentId?'current':ch.locked?'locked':'open';
      return <div key={ch.id} className="lf-chapternode" data-state={state} role="listitem">
        <button type="button" className="lf-chapternode-dot" style={{cursor:ch.locked?'default':'pointer'}} aria-label={ch.label} data-utterance={ch.utterance} onClick={()=>!ch.locked&&onSelect&&onSelect(ch.id)}>
          <Icon name={ch.done?'check':ch.locked?'lock':'book-open'} size={20}/>
        </button>
        <span className="lf-chapternode-label">{ch.label}</span>
      </div>;
    })}
  </div>;
}

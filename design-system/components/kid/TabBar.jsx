import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function TabBar({ items=[], activeId, onSelect }) {
  return <nav className="lf-tabbar" aria-label="Places">
    {items.map(it=><button key={it.id} type="button" className="lf-tab" aria-selected={it.id===activeId?'true':'false'} data-utterance={it.utterance} onClick={()=>onSelect&&onSelect(it.id)}>
      <span className="lf-tab-pill"><Icon name={it.icon} size={24}/></span>
      <span>{it.label}</span>
    </button>)}
  </nav>;
}

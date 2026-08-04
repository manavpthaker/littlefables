import React from 'react';
export function ParentTabs({ tabs=[], activeId, onSelect }) {
  return <div className="lf-parenttabs" role="tablist">
    {tabs.map(t=><button key={t.id} type="button" role="tab" className="lf-parenttab" aria-selected={t.id===activeId?'true':'false'} onClick={()=>onSelect&&onSelect(t.id)}>{t.label}</button>)}
  </div>;
}

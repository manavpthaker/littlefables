import React from 'react';
export function Sheet({ title, doubleRule=true, children, style }) {
  return <section className="lf-sheet" style={style}>
    {doubleRule?<div className="lf-sheet-rules" aria-hidden="true"><i></i><i></i></div>:null}
    {title?<h3 className="lf-sheet-title">{title}</h3>:null}
    {children}
  </section>;
}

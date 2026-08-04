import React from 'react';
export function Shelf({ label, children }) {
  return <div className="lf-shelf">
    {label?<span className="lf-shelf-label">{label}</span>:null}
    <div className="lf-shelf-row">{children}</div>
    <div className="lf-shelf-board" aria-hidden="true"></div>
  </div>;
}

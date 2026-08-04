import React from 'react';
export function Rule({ kind='soft', className, style }) {
  const cls=className?' '+className:'';
  if(kind==='double') return <div className={'lf-rule-double'+cls} style={style} aria-hidden="true"><i></i><i></i></div>;
  if(kind==='dot') return <div className={'lf-rule-dot'+cls} style={style} aria-hidden="true"><i></i><b></b><i></i></div>;
  return <hr className={'lf-rule'+(kind==='faint'?' lf-rule--faint':'')+cls} style={style}/>;
}

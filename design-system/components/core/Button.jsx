import React from 'react';
import { Icon } from './Icon.jsx';
export function Button({ variant='primary', size='standard', icon, utterance, disabled, children, onClick, type='button', href }) {
  const cls=['lf-btn','lf-btn--'+variant, size!=='standard'?'lf-btn--'+size:''].filter(Boolean).join(' ');
  const inner=<>{icon?<Icon name={icon} size={size==='hero'?24:20}/>:null}{children}</>;
  if(href) return <a className={cls} href={href} data-utterance={utterance}>{inner}</a>;
  return <button type={type} className={cls} disabled={disabled} data-utterance={utterance} onClick={onClick}>{inner}</button>;
}

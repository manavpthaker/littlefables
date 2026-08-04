import React from 'react';
import { Icon } from './Icon.jsx';
export function IconButton({ name, label, variant='plain', size='standard', utterance, disabled, onClick }) {
  const cls=['lf-iconbtn', variant!=='plain'?'lf-iconbtn--'+variant:'', size!=='standard'?'lf-iconbtn--'+size:''].filter(Boolean).join(' ');
  return <button type="button" className={cls} aria-label={label} title={label} disabled={disabled} data-utterance={utterance} onClick={onClick}><Icon name={name} size={size==='hero'?26:size==='compact'?18:22}/></button>;
}

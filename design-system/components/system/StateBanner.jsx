import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function StateBanner({ kind='notice', icon, message, utterance, children }) {
  const icons={offline:'motif-moon',syncing:'refresh-cw',success:'check',notice:'alert-circle'};
  return <div className="lf-statebanner" data-kind={kind} data-utterance={utterance||message} role="status">
    <Icon name={icon||icons[kind]} size={22}/>
    <span>{message}</span>
    {children?<span className="lf-statebanner-action">{children}</span>:null}
  </div>;
}

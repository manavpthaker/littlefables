import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function ListRow({ label, sub, value, icon, chevron=true, onPress }) {
  return <button type="button" className="lf-listrow" onClick={onPress}>
    {icon?<Icon name={icon} size={20} color="var(--ink-soft)"/>:null}
    <span><span className="lf-listrow-label">{label}</span>{sub?<span className="lf-listrow-sub">{sub}</span>:null}</span>
    <span className="lf-listrow-value">{value}{chevron?<Icon name="chevron-right" size={18} color="var(--ink-faint)"/>:null}</span>
  </button>;
}

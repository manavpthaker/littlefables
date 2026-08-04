import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function TrustRow({ items }) {
  const list=items||[
    {icon:'motif-book',label:'Illustrated & narrated'},
    {icon:'clock',label:'Delivered in days'},
    {icon:'shield',label:'Intake deleted after delivery'},
    {icon:'motif-moon',label:'No ads. No autoplay.'},
  ];
  return <div className="lf-trustrow" data-density="outward">
    {list.map((it,i)=><span key={i} className="lf-trustrow-item"><Icon name={it.icon} size={22}/>{it.label}</span>)}
  </div>;
}

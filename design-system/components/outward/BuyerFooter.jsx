import React from 'react';
import { Wordmark } from '../core/Wordmark.jsx';
import { Ornament } from '../core/Ornament.jsx';
export function BuyerFooter({ links, fine="We delete your intake once your book is delivered — unless you say otherwise. No ads. No algorithm. No autoplay." }) {
  const list=links||[{label:'Etsy shop',href:'#'},{label:'Write to us',href:'#'},{label:'Privacy',href:'#'}];
  return <footer className="lf-buyerfooter" data-density="outward">
    <Ornament kind="rule-and-dot" style={{width:220}}/>
    <Wordmark markSize={34}/>
    <nav className="lf-buyerfooter-links">{list.map((l,i)=><a key={i} href={l.href}>{l.label}</a>)}</nav>
    <p className="lf-buyerfooter-fine">{fine}</p>
  </footer>;
}

import React from 'react';
import { Ornament } from '../core/Ornament.jsx';
export function Celebration({ title, message, utterance, ceremonial, children }) {
  return <section className="lf-celebration" data-utterance={utterance||title} role="status">
    {ceremonial?<><span className="lf-filigree-tl"><Ornament kind="filigree" size={34}/></span><span className="lf-filigree-tr"><Ornament kind="filigree" size={34}/></span></>:null}
    <Ornament kind="sunburst" size={56} className="lf-ornament--burst"/>
    <h3 className="lf-celebration-title">{title}</h3>
    {message?<p className="lf-celebration-sub">{message}</p>:null}
    {children}
  </section>;
}

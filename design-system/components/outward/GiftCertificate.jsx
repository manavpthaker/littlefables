import React from 'react';
import { Ornament } from '../core/Ornament.jsx';
import { Wordmark } from '../core/Wordmark.jsx';
export function GiftCertificate({ childName='Rosa', fromName='Grandma June', message='A storybook is being written just for you — you are the hero of this one.', code='LF-2041', date='April 2026' }) {
  return <div className="lf-cert" data-density="outward">
    <span className="lf-cert-fil lf-cert-fil--tl"><Ornament kind="filigree" size={40}/></span>
    <span className="lf-cert-fil lf-cert-fil--tr"><Ornament kind="filigree" size={40}/></span>
    <span className="lf-cert-fil lf-cert-fil--bl"><Ornament kind="filigree" size={40}/></span>
    <span className="lf-cert-fil lf-cert-fil--br"><Ornament kind="filigree" size={40}/></span>
    <span className="lf-cert-eyebrow">a story is being written for</span>
    <span className="lf-cert-name">{childName}</span>
    <Ornament kind="rule-and-dot" className="lf-cert-rule"/>
    <p className="lf-cert-message">{message}</p>
    <p className="lf-cert-message" style={{fontStyle:'italic'}}>with love, {fromName}</p>
    <div className="lf-cert-meta"><span>certificate {code}</span><span>{date}</span></div>
    <Wordmark markSize={30} style={{marginTop:10}}/>
  </div>;
}

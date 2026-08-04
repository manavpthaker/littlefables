import React from 'react';
export function WordJar({ words=[], countLabel, utterance }) {
  return <span className="lf-wordjar" data-utterance={utterance}>
    <span className="lf-wordjar-lid" aria-hidden="true"></span>
    <span className="lf-wordjar-body">{words.slice(0,6).map((w,i)=><span key={i} className="lf-wordjar-chip">{w}</span>)}</span>
    {countLabel?<span className="lf-wordjar-count">{countLabel}</span>:null}
  </span>;
}

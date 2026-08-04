import React from 'react';
// The buddy is a drawn small character (folk fox stand-in), not a corporate avatar.
export function Buddy({ state='idle', size=84, say, utterance }) {
  return <span className="lf-buddy" data-state={state} data-utterance={utterance||say}>
    <span className="lf-buddy-face" style={{width:size,height:size}}>
      <svg width={size*0.62} height={size*0.62} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 14 C 8 8, 9 5, 12 3.6 C 15 6, 16 9, 15.6 12"/>
        <path d="M38 14 C 40 8, 39 5, 36 3.6 C 33 6, 32 9, 32.4 12"/>
        <path d="M24 9 C 32 9, 39 14, 40 21 C 41 28, 35 33, 30 36 L 24 40 L 18 36 C 13 33, 7 28, 8 21 C 9 14, 16 9, 24 9 Z"/>
        <circle cx="17.5" cy="21" r="1.6" fill="currentColor" stroke="none"/>
        <circle cx="30.5" cy="21" r="1.6" fill="currentColor" stroke="none"/>
        <path d="M21.5 29.5 C 23 28.5, 25 28.5, 26.5 29.5 L 24 32 Z" fill="currentColor" stroke="none"/>
      </svg>
      <span className="lf-buddy-ring" aria-hidden="true"></span>
    </span>
    {say?<span className="lf-buddy-say">{say}</span>:null}
  </span>;
}

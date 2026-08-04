import React from 'react';
export function WordCapsule({ word, saved, utterance, onStar }) {
  return <span className="lf-wordcapsule" data-utterance={utterance}>
    <span className="lf-wordcapsule-word">{word}</span>
    <button type="button" className="lf-wordcapsule-star" data-saved={saved?'true':'false'} aria-label={saved?'Saved to your word jar':'Save to your word jar'} aria-pressed={!!saved} onClick={onStar}>
      <svg width="22" height="22" viewBox="0 0 20 20" fill={saved?'var(--brass)':'none'} stroke="var(--brass)" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M10 1.5 12.4 7l6 .5-4.6 4 1.4 5.9L10 14.2 4.8 17.4 6.2 11.5 1.6 7.5l6-.5Z"/></svg>
    </button>
  </span>;
}

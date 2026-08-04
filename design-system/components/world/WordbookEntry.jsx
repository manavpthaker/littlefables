import React from 'react';
export function WordbookEntry({ word, syllables, definition, example, utterance }) {
  return <article className="lf-wordbookentry" data-utterance={utterance||word+'. '+definition}>
    <div className="lf-wordbookentry-head"><span className="lf-wordbookentry-word">{word}</span>{syllables?<span className="lf-wordbookentry-syll">{syllables}</span>:null}</div>
    <p className="lf-wordbookentry-def">{definition}</p>
    {example?<p className="lf-wordbookentry-ex">"{example}"</p>:null}
  </article>;
}

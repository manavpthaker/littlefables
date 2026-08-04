import React from 'react';
export function QARecord({ question, answer, meta }) {
  return <div className="lf-qarecord">
    <p className="lf-qarecord-q">{question}</p>
    <p className="lf-qarecord-a">{answer}</p>
    {meta?<p className="lf-qarecord-meta">{meta}</p>:null}
  </div>;
}

import React from 'react';
import { QARecord } from './QARecord.jsx';
export function CheckpointTranscript({ title, date, records=[] }) {
  return <section className="lf-transcript">
    <div className="lf-transcript-head"><h3 className="lf-transcript-title">{title}</h3>{date?<span className="lf-transcript-date">{date}</span>:null}</div>
    {records.map((r,i)=><QARecord key={i} question={r.question} answer={r.answer} meta={r.meta}/>)}
  </section>;
}

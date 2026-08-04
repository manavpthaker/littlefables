import React from 'react';
import { Buddy } from '../kid/Buddy.jsx';
export function Checkpoint({ question, buddyState='speaking', utterance, children }) {
  return <section className="lf-checkpoint" data-utterance={utterance||question}>
    <Buddy state={buddyState} size={64}/>
    <h3 className="lf-checkpoint-q">{question}</h3>
    {children}
  </section>;
}

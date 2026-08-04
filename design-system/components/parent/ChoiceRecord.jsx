import React from 'react';
export function ChoiceRecord({ where, chose, alternative }) {
  return <div className="lf-choicerecord">
    <span className="lf-choicerecord-where">{where}</span>
    <span className="lf-choicerecord-chose">{chose}</span>
    {alternative?<span className="lf-choicerecord-alt">instead of: {alternative}</span>:null}
  </div>;
}

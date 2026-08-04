import React from 'react';
export function ComprehensionProfile({ skills=[] }) {
  return <div className="lf-comprofile">
    {skills.map((s,i)=><div key={i} className="lf-comprofile-row">
      <span className="lf-comprofile-skill">{s.label}</span>
      <span className="lf-comprofile-bar"><i style={{width:(s.level*100)+'%'}}></i></span>
      <span className="lf-comprofile-word">{s.word}</span>
    </div>)}
  </div>;
}

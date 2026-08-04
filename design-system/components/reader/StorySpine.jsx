import React from 'react';
export function StorySpine({ progress=0, ticks=[], height=280 }) {
  return <div className="lf-storyspine" style={{height}} aria-hidden="true">
    <div className="lf-storyspine-track">
      <div className="lf-storyspine-fill" style={{height:(progress*100)+'%'}}></div>
      {ticks.map((t,i)=><span key={i} className="lf-storyspine-tick" data-done={t.done?'true':'false'} style={{top:(t.at*100)+'%'}}></span>)}
      <span className="lf-storyspine-ribbon" style={{top:'calc('+(progress*100)+'% - 4px)'}}></span>
    </div>
  </div>;
}

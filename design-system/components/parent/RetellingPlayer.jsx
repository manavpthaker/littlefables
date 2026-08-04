import React from 'react';
import { IconButton } from '../core/IconButton.jsx';
export function RetellingPlayer({ playing, progress=0, duration, bars=24, onToggle }) {
  const heights=[0.4,0.7,0.5,0.9,0.6,0.8,0.35,0.65,0.75,0.5,0.85,0.45,0.6,0.9,0.55,0.7,0.4,0.8,0.5,0.65,0.9,0.45,0.7,0.55];
  return <div className="lf-retelling">
    <IconButton name={playing?'pause':'play'} label={playing?'Pause':'Play retelling'} variant="primary" onClick={onToggle}/>
    <span className="lf-retelling-bars" aria-hidden="true">{Array.from({length:bars}).map((_,i)=><i key={i} data-played={i/bars<progress?'true':'false'} style={{height:(heights[i%heights.length]*100)+'%'}}></i>)}</span>
    {duration?<span className="lf-retelling-time">{duration}</span>:null}
  </div>;
}

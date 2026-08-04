import React from 'react';
import { Ornament } from '../core/Ornament.jsx';
export function PaintingWash({ label='painting your page', width='100%', height=220, utterance }) {
  return <div className="lf-paintingwash" style={{width,height}} data-utterance={utterance||'The paints are still wet. One moment.'} role="status">
    <Ornament kind="sunburst" size={44}/>
    <span className="lf-paintingwash-label">{label}</span>
  </div>;
}

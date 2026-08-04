import React from 'react';
import { Wordmark } from '../core/Wordmark.jsx';
import { Ornament } from '../core/Ornament.jsx';
// Pinterest pin. Design size 1000x1500 (2:3).
export function PinterestPin({ title='The custom storybook you would actually be proud to gift.', line='Your kid, in their own storybook — written, illustrated, narrated.', scale=1 }) {
  return <div className="lf-pin" data-density="outward" style={{transform:'scale('+scale+')',transformOrigin:'top left'}}>
    <div className="lf-pin-art">
      <Ornament kind="sunburst" size={110}/>
      <span className="lf-pin-title">{title}</span>
    </div>
    <div className="lf-pin-bottom">
      <span className="lf-pin-line">{line}</span>
      <Wordmark markSize={52}/>
    </div>
  </div>;
}

import React from 'react';
import { Wordmark } from '../core/Wordmark.jsx';
import { Ornament } from '../core/Ornament.jsx';
// Etsy primary listing image. Design size 1350x1012 (export at 2x for 2700x2025).
export function EtsyHero({ childName='Rosa', bookTitle='and the Paper Boat', headline='Your kid, in their own storybook.', points, scale=1 }) {
  const list=points||['Written for who they are','Illustrated in a style you choose','Narrated, saved to their iPad'];
  return <div className="lf-etsyhero" data-density="outward" style={{transform:'scale('+scale+')',transformOrigin:'top left'}}>
    <div className="lf-etsyhero-frame" aria-hidden="true"></div>
    <div className="lf-etsyhero-book">
      <Ornament kind="sunburst" size={72}/>
      <span className="lf-etsyhero-booktitle">{childName}<br/>{bookTitle}</span>
      <span className="lf-etsyhero-bookname">a little fable for {childName}</span>
    </div>
    <div className="lf-etsyhero-copy">
      <Wordmark markSize={54}/>
      <h2 className="lf-etsyhero-h">{headline}</h2>
      <div className="lf-etsyhero-points">{list.map((p,i)=><span key={i}>— {p}</span>)}</div>
      <span className="lf-etsyhero-tags">personalized · illustrated · narrated</span>
    </div>
  </div>;
}

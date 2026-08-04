import React from 'react';
import { Wordmark } from '../core/Wordmark.jsx';
export function ColoringPage({ title='Rosa and the Paper Boat', sceneNote='line art of this scene prints here', nameLabel='colored by' }) {
  return <div className="lf-coloring" data-density="outward">
    <div className="lf-coloring-head"><span className="lf-coloring-title">{title}</span><Wordmark markSize={26}/></div>
    <div className="lf-coloring-art">{sceneNote}</div>
    <div className="lf-coloring-nameline"><span>{nameLabel}</span><i></i></div>
  </div>;
}

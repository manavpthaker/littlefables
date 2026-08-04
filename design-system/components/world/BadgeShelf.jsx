import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function BadgeShelf({ badges=[] }) {
  return <div className="lf-badgeshelf">
    <div className="lf-badgeshelf-row">
      {badges.map(b=><div key={b.id} className="lf-badge" data-earned={b.earned?'true':'false'} data-utterance={b.utterance}>
        <span className="lf-badge-medal"><Icon name={b.icon||'award'} size={28}/></span>
        <span className="lf-badge-label">{b.label}</span>
      </div>)}
    </div>
    <div className="lf-shelf-board" aria-hidden="true"></div>
  </div>;
}

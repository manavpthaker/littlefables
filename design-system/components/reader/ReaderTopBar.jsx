import React from 'react';
import { IconButton } from '../core/IconButton.jsx';
import { Icon } from '../core/Icon.jsx';
export function ReaderTopBar({ chapterLabel, sunsLabel, overArt=true, onBack, onSettings }) {
  return <div className={'lf-readertopbar'+(overArt?' lf-readertopbar--overart':'')}>
    <IconButton name="chevron-left" label="Back to the shelf" onClick={onBack}/>
    <span className="lf-readertopbar-label">{chapterLabel}</span>
    {sunsLabel?<span className="lf-readertopbar-suns"><Icon name="motif-sun" size={18}/>{sunsLabel}</span>:null}
    {onSettings?<IconButton name="settings" label="Settings" onClick={onSettings}/>:null}
  </div>;
}

import React from 'react';
import { IconButton } from '../core/IconButton.jsx';
export function Transport({ playing, label, onPlay, onBack, onForward, utterance }) {
  return <div className="lf-transport" data-utterance={utterance} role="group" aria-label="Story controls">
    <IconButton name="skip-back" label="Back a page" onClick={onBack}/>
    <IconButton name={playing?'pause':'play'} label={playing?'Pause':'Play'} variant="primary" size="hero" onClick={onPlay}/>
    <IconButton name="skip-forward" label="Next page" onClick={onForward}/>
    {label?<span className="lf-transport-label">{label}</span>:null}
  </div>;
}

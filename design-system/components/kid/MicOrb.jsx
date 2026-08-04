import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function MicOrb({ state='idle', utterance, onPress }) {
  return <button type="button" className="lf-micorb" data-state={state} data-utterance={utterance} aria-label={state==='listening'?'Listening — tap when done':'Talk to the story'} onClick={onPress}>
    <Icon name="mic" size={34}/>
  </button>;
}

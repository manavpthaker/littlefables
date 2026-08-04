import React from 'react';
import { Buddy } from '../kid/Buddy.jsx';
export function ErrorCharacter({ message="The story kitchen is resting. Let's read one from the shelf.", utterance, children }) {
  return <div className="lf-errorchar" data-utterance={utterance||message} role="status">
    <Buddy state="idle" size={72}/>
    <p className="lf-errorchar-msg">{message}</p>
    {children}
  </div>;
}

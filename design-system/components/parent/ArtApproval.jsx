import React from 'react';
import { Button } from '../core/Button.jsx';
import { LifecycleChip } from './LifecycleChip.jsx';
export function ArtApproval({ title, note, imgSrc, state='needsReview', onApprove, onRequestChange }) {
  return <div className="lf-artapproval">
    <span className="lf-artapproval-thumb">{imgSrc?<img src={imgSrc} alt={title}/>:null}</span>
    <div className="lf-artapproval-body">
      <span><LifecycleChip state={state}/></span>
      <span className="lf-artapproval-title">{title}</span>
      {note?<span className="lf-artapproval-note">{note}</span>:null}
      <div className="lf-artapproval-actions">
        <Button size="compact" onClick={onApprove}>Approve</Button>
        <Button size="compact" variant="secondary" onClick={onRequestChange}>Request a change</Button>
      </div>
    </div>
  </div>;
}

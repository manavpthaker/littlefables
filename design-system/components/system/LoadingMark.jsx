import React from 'react';
import { MARK_INNER, MARK_VIEWBOX } from '../core/markSvg.js';
export function LoadingMark({ size=96, label, utterance }) {
  return <div className="lf-loadingmark" data-utterance={utterance} role="status" aria-label={label||'Loading'}>
    <svg className="lf-mark lf-mark--breath lf-mark--loading" width={size} height={size*1.05} viewBox={MARK_VIEWBOX} aria-hidden="true" dangerouslySetInnerHTML={{__html:MARK_INNER}}/>
    {label?<span className="lf-loadingmark-label">{label}</span>:null}
  </div>;
}

import React from 'react';
import { MARK_INNER, MARK_VIEWBOX } from './markSvg.js';
export function Wordmark({ layout='horizontal', markSize=44, text=true, animated=false, drawIn=false, color, className, style }) {
  const cls=['lf-wordmark',layout==='stacked'?'lf-wordmark--stacked':'',className||''].filter(Boolean).join(' ');
  const svgCls=['lf-mark',animated?'lf-mark--breath':'',drawIn?'lf-mark--draw':''].filter(Boolean).join(' ');
  const mark=<svg className={svgCls} width={markSize} height={markSize*1.05} viewBox={MARK_VIEWBOX} aria-hidden="true" dangerouslySetInnerHTML={{__html:MARK_INNER}}/>;
  return <span className={cls} style={{color:color||'var(--ink)',...style}}>{mark}{text&&layout!=='mark-only'?<span className="lf-wordmark-text" style={{fontSize:markSize*0.62}}>Little Fables</span>:null}</span>;
}

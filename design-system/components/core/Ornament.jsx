import React from 'react';
const SB=(()=>{const l=[];for(let a=0;a<360;a+=30){const r=a%60===0?15:11.5;const c=Math.cos(a*Math.PI/180),s=Math.sin(a*Math.PI/180);l.push(<line key={a} x1={20+c*6.5} y1={20+s*6.5} x2={20+c*r} y2={20+s*r}/>);}return l;})();
export function Ornament({ kind='fleuron', letter='A', size, color, className, style }) {
  const cls='lf-ornament'+(className?' '+className:'');
  if(kind==='fleuron') return <svg className={cls} width={size||26} height={size||26} viewBox="0 0 24 24" fill="none" stroke={color||'var(--ink-soft)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21 C 12 16, 12 13, 12 10"/><path d="M12 10 C 9.5 9.5, 8 7.5, 8.2 4.8 C 10.5 5.2, 12 7, 12 10 Z" fill={color||'var(--ink-soft)'} stroke="none"/><path d="M12 10 C 14.5 9.5, 16 7.5, 15.8 4.8 C 13.5 5.2, 12 7, 12 10 Z" fill={color||'var(--ink-soft)'} stroke="none"/><path d="M12 8.5 C 11.6 6, 11.6 4.2, 12 2.2 C 12.4 4.2, 12.4 6, 12 8.5 Z" fill={color||'var(--ink-soft)'} stroke="none"/><path d="M12 15.5 C 9.5 15.5, 7.5 14.5, 6 12.5"/><path d="M12 15.5 C 14.5 15.5, 16.5 14.5, 18 12.5"/></svg>;
  if(kind==='double-rule') return <div className={cls+' lf-rule-double'} style={style} aria-hidden="true"><i></i><i></i></div>;
  if(kind==='rule-and-dot') return <div className={cls+' lf-rule-dot'} style={style} aria-hidden="true"><i></i><b></b><i></i></div>;
  if(kind==='filigree') return <svg className={cls} width={size||40} height={size||40} viewBox="0 0 40 40" fill="none" stroke={color||'var(--gilt)'} strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M38 4 L14 4 C 8 4, 4 8, 4 14 L4 38"/><path d="M38 10 L16 10 C 12.7 10, 10 12.7, 10 16 L10 38"/><path d="M17 17 C 20 17, 22 19, 22 22 C 22 24.2, 20.4 25.4, 18.8 25.4 C 17.5 25.4, 16.6 24.4, 16.6 23.2 C 16.6 22.2, 17.4 21.4, 18.4 21.4"/></svg>;
  if(kind==='sunburst') return <svg className={cls} width={size||40} height={size||40} viewBox="0 0 40 40" aria-hidden="true"><g stroke={color||'var(--brass)'} strokeWidth="2" strokeLinecap="round">{SB}</g><circle cx="20" cy="20" r="3" fill={color||'var(--brass)'}/></svg>;
  if(kind==='dropcap'){const s=size||64;return <span className={cls+' lf-dropcap-frame'} style={{width:s,height:s,fontSize:s*0.62}} aria-hidden="true">{letter}</span>;}
  return null;
}

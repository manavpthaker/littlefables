import React from 'react';
// Table-based skeleton that renders in Outlook + Gmail. 600px, paper background, bulletproof oxblood button.
// In production, markSrc and href must be absolute URLs and fonts fall back to Georgia.
const COPY={
'intake-ack':{subject:'We have everything we need',body:(n)=>[
  n+"'s story is in good hands. Thank you for telling us so much — it all goes into the book.",
  'Our writers are at work now, and the illustrations follow. You will see a preview within three days, and you approve every page before we deliver.'],cta:'See what happens next'},
'preview-delivery':{subject:(n)=>n+"'s preview is ready",body:(n)=>[
  'Three spreads are painted and waiting for you.',
  'Take a look and tell us what to adjust — a name, a color, a detail. Or approve them, and we finish the rest of '+n+"'s book."],cta:'Open the preview'},
'delivery':{subject:(n)=>n+"'s book is ready",body:(n)=>[
  'Twenty pages, illustrated and narrated. '+n+' is the hero of this one.',
  'Open it on the iPad and add it to the home screen — it lives there like a favorite app, no account needed. Twenty quiet minutes, whenever you like.'],cta:'Open '+"the book"},
'checkin':{subject:'How was the first read?',body:(n)=>[
  'A week with the book — we hope '+n+' has found a favorite page.',
  'If anything reads oddly or a picture feels off, reply to this note and we will repaint it. That is part of the craft.'],cta:'Reply to us'},
'review-request':{subject:'A small favor',body:(n)=>[
  'If '+n+"'s book made bedtime a little better, a short review helps another family find us.",
  'Two sentences is plenty. Thank you for letting us make something for your shelf.'],cta:'Leave a review'}};
export function EmailShell({ variant='delivery', childName='Rosa', markSrc='../../assets/brand/mark-ink.png', href='#', preheader }) {
  const c=COPY[variant]||COPY['delivery'];
  const subject=typeof c.subject==='function'?c.subject(childName):c.subject;
  const paras=c.body(childName);
  const td={fontFamily:"'EB Garamond',Georgia,Cambria,serif"};
  return <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{background:'#EDE3CE',padding:'24px 0'}}><tbody>
    <tr><td align="center">
      <table role="presentation" width="600" cellPadding="0" cellSpacing="0" style={{width:600,maxWidth:'100%',background:'#EDE3CE'}}><tbody>
        {preheader?<tr><td style={{...td,fontSize:1,lineHeight:'1px',color:'#EDE3CE',overflow:'hidden'}}>{preheader}</td></tr>:null}
        <tr><td style={{padding:'18px 32px 8px'}}>
          <table role="presentation" cellPadding="0" cellSpacing="0"><tbody><tr>
            <td><img src={markSrc} width="26" height="27" alt="Little Fables" style={{display:'block'}}/></td>
            <td style={{fontFamily:"'IM Fell English',Georgia,serif",fontSize:19,color:'#2A1D12',paddingLeft:9}}>Little Fables</td>
          </tr></tbody></table>
        </td></tr>
        <tr><td style={{padding:'0 32px'}}><div style={{borderTop:'1px solid #8A7156',height:3}}></div><div style={{borderTop:'2px solid #8A7156'}}></div></td></tr>
        <tr><td style={{...td,padding:'26px 32px 6px',fontSize:26,lineHeight:'32px',color:'#2A1D12',fontFamily:"'IM Fell English',Georgia,serif"}}>{subject}</td></tr>
        {paras.map((p,i)=><tr key={i}><td style={{...td,padding:'8px 32px',fontSize:17,lineHeight:'26px',color:'#57432E'}}>{p}</td></tr>)}
        <tr><td style={{padding:'22px 32px 8px'}}>
          <table role="presentation" cellPadding="0" cellSpacing="0"><tbody><tr>
            <td style={{background:'#7D2E2B',borderRadius:10}}><a href={href} style={{...td,display:'inline-block',padding:'13px 26px',fontSize:17,color:'#F3EBD8',textDecoration:'none'}}>{c.cta}</a></td>
          </tr></tbody></table>
        </td></tr>
        <tr><td style={{...td,padding:'26px 32px 30px',fontSize:13,lineHeight:'19px',color:'#8A7156'}}>
          Little Fables · made for one child at a time<br/>
          We delete your intake once your book is delivered — unless you say otherwise.<br/>
          <a href="#" style={{color:'#8A7156'}}>unsubscribe</a>
        </td></tr>
      </tbody></table>
    </td></tr>
  </tbody></table>;
}

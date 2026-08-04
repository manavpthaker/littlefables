import React from 'react';
import { Wordmark } from '../core/Wordmark.jsx';
import { Button } from '../core/Button.jsx';
export function MarketingHero({ eyebrow='a book written for one child', title='Your kid, in their own storybook.', sub='Written for who they are, illustrated in a style you helped choose. Delivered in days, saved to their iPad like a favorite app.', cta='See how it works', secondaryCta, onCta }) {
  return <section className="lf-mkhero" data-density="outward">
    <Wordmark layout="stacked" markSize={64}/>
    <span className="lf-mkhero-eyebrow">{eyebrow}</span>
    <h1 className="lf-mkhero-title">{title}</h1>
    <p className="lf-mkhero-sub">{sub}</p>
    <div className="lf-mkhero-ctas">
      <Button size="hero" onClick={onCta}>{cta}</Button>
      {secondaryCta?<Button variant="quiet">{secondaryCta}</Button>:null}
    </div>
  </section>;
}

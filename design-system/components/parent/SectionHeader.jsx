import React from 'react';
import { Rule } from '../core/Rule.jsx';
export function SectionHeader({ label }) {
  return <div className="lf-sectionheader"><span className="lf-sectionheader-label">{label}</span><Rule kind="faint"/></div>;
}

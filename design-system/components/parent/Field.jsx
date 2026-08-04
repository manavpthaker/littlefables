import React from 'react';
export function Field({ label, help, error, children }) {
  return <label className="lf-field">
    <span className="lf-field-label">{label}</span>
    {children}
    {error?<span className="lf-field-error">{error}</span>:help?<span className="lf-field-help">{help}</span>:null}
  </label>;
}

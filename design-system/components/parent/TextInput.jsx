import React from 'react';
export function TextInput({ value, placeholder, multiline, invalid, onChange, type='text' }) {
  if(multiline) return <textarea className="lf-input" data-invalid={invalid?'true':'false'} value={value} placeholder={placeholder} onChange={e=>onChange&&onChange(e.target.value)}/>;
  return <input className="lf-input" type={type} data-invalid={invalid?'true':'false'} value={value} placeholder={placeholder} onChange={e=>onChange&&onChange(e.target.value)}/>;
}

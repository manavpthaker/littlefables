'use client';

import { SunsRow as DsSunsRow } from '@ds/components/world/SunsRow.jsx';

// Client wrapper — SunsRow → Icon uses useEffect internally, so any indirect
// consumer must live in a client tree. Server components import from here.
export function SunsRow(props: { earned: number[]; today: number }) {
  return <DsSunsRow earned={props.earned} today={props.today} />;
}

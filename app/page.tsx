import { redirect } from 'next/navigation';

// Zero-friction entry: any browser landing on the root goes through
// /api/enter, which either finds a valid child-device cookie (→ /read)
// or auto-mints one for the household's first child (→ /read). The
// parent surface only shows up if the household has no children yet.
//
// Setting a cookie can't happen inside an RSC render, so we bounce
// through a route handler that CAN set-cookie + redirect.
export default function RootPage() {
  redirect('/api/enter');
}

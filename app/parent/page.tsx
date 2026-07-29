import { redirect } from 'next/navigation';

// The parent surface has one page — Settings. Landing on /parent goes there.
export default function ParentIndex() {
  redirect('/parent/settings');
}

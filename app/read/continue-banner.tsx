'use client';

import { useRouter } from 'next/navigation';
import { ContinueCard } from '@ds/components/kid/ContinueCard.jsx';

export interface ContinueTarget {
  id: string;
  title: string;
  chapterCaption?: string;
  progress: number;
}

export function ContinueBanner({ target }: { target: ContinueTarget }) {
  const router = useRouter();
  return (
    <section style={{ padding: 'var(--space-4) var(--space-4) 0' }}>
      <ContinueCard
        title={target.title}
        chapter={target.chapterCaption}
        progress={target.progress}
        onContinue={() => router.push(`/read/story/${target.id}`)}
      />
    </section>
  );
}

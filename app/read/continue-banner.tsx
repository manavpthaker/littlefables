'use client';

import { useRouter } from 'next/navigation';
import { ContinueCard } from '@ds/components/kid/ContinueCard.jsx';

export interface ContinueTarget {
  id: string;
  title: string;
  chapterCaption?: string;
  cover?: string;
  progress: number;
}

export function ContinueBanner({ target }: { target: ContinueTarget }) {
  const router = useRouter();
  return (
    <section>
      <ContinueCard
        title={target.title}
        chapter={target.chapterCaption}
        cover={target.cover}
        progress={target.progress}
        onContinue={() => router.push(`/read/story/${target.id}`)}
      />
    </section>
  );
}

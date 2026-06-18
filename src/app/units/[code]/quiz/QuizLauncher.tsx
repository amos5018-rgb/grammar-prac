'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Question } from '@/lib/types';
import { AnalyticsMode } from '@/lib/analytics';
import QuizRunner from '@/components/QuizRunner';

function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export default function QuizLauncher({ unitCode, questions }: { unitCode: string; questions: Question[] }) {
  const searchParams = useSearchParams();
  const nParam = searchParams.get('n');
  const blockParam = searchParams.get('block');
  const n = nParam ? parseInt(nParam, 10) : 0;

  const [selected] = useState(() => {
    let pool = questions;
    if (blockParam) {
      pool = questions.filter(q => q.block === blockParam);
    }
    if (Number.isFinite(n) && n > 0 && n < pool.length) {
      return sample(pool, n);
    }
    return pool;
  });

  const fullAttempt = selected.length === questions.length;
  const mode: AnalyticsMode = blockParam
    ? (n === 5 ? 'block_random_5' : 'block_full')
    : n === 10
      ? 'unit_random_10'
      : n === 5
        ? 'unit_random_5'
        : 'unit_full';

  return <QuizRunner unitCode={unitCode} questions={selected} fullAttempt={fullAttempt} mode={mode} />;
}

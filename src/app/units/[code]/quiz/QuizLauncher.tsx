'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Question, QuizMode } from '@/lib/types';
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
  const from = searchParams.get('from');

  const [selected] = useState(() => {
    let pool = questions;
    if (blockParam) {
      pool = questions.filter(q => q.block === blockParam);
    }
    const n = nParam ? parseInt(nParam, 10) : 0;
    if (Number.isFinite(n) && n > 0 && n < pool.length) {
      return sample(pool, n);
    }
    return pool;
  });

  const fullAttempt = selected.length === questions.length;
  const isRandom = selected.length < (blockParam ? questions.filter(q => q.block === blockParam).length : questions.length);
  const quizMode: QuizMode = blockParam
    ? (isRandom ? 'block-random' : 'block-full')
    : (fullAttempt ? 'full' : 'random');

  return <QuizRunner unitCode={unitCode} questions={selected} fullAttempt={fullAttempt} quizMode={quizMode} from={from} />;
}

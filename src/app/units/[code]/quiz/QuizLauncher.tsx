'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Question } from '@/lib/types';
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

  // '랜덤 N문제' 모드면 무작위로 N개 선별, 아니면 전체
  const [selected] = useState(() => {
    const n = nParam ? parseInt(nParam, 10) : 0;
    if (Number.isFinite(n) && n > 0 && n < questions.length) {
      return sample(questions, n);
    }
    return questions;
  });

  return <QuizRunner unitCode={unitCode} questions={selected} />;
}

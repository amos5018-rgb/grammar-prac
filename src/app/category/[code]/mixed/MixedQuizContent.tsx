'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/lib/types';
import { getUnitProgress } from '@/lib/storage';
import QuizRunner from '@/components/QuizRunner';

function weightedSample(questions: Question[], count: number, progress: Record<string, { attempts: number; bestScore: number | null }>): Question[] {
  const weighted = questions.map(q => {
    const p = progress[q.unitCode];
    const score = p?.bestScore ?? 50;
    const weight = Math.max(1, 110 - score);
    return { q, weight };
  });

  const selected: Question[] = [];
  const usedIds = new Set<string>();

  while (selected.length < count && weighted.length > 0) {
    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let r = Math.random() * totalWeight;
    let idx = 0;
    for (let i = 0; i < weighted.length; i++) {
      r -= weighted[i].weight;
      if (r <= 0) { idx = i; break; }
    }
    const item = weighted[idx];
    if (!usedIds.has(item.q.id)) {
      selected.push(item.q);
      usedIds.add(item.q.id);
    }
    weighted.splice(idx, 1);
  }

  return selected;
}

interface Props {
  questions: Question[];
  categoryCode: string;
  categoryName: string;
}

export default function MixedQuizContent({ questions, categoryCode, categoryName }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Question[] | null>(null);

  useEffect(() => {
    if (questions.length === 0) {
      router.replace(`/category/${categoryCode}`);
      return;
    }
    const progress = getUnitProgress();
    const count = Math.min(10, questions.length);
    setSelected(weightedSample(questions, count, progress));
  }, [questions, categoryCode, router]);

  if (!selected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">문제를 준비하는 중...</p>
      </div>
    );
  }

  return <QuizRunner unitCode={`mixed-${categoryCode}`} questions={selected} />;
}

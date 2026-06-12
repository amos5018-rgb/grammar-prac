'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDedupedWrongAnswers, getDueQuestionIds } from '@/lib/storage';
import { Question } from '@/lib/types';
import QuizRunner from '@/components/QuizRunner';

export default function ReviewQuizContent({ allQuestions }: { allQuestions: Question[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unitFilter = searchParams.get('unit');
  const dueOnly = searchParams.get('due') === '1';
  const [questions, setQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    let wrong = getDedupedWrongAnswers();
    if (unitFilter) {
      wrong = wrong.filter(w => w.unitCode === unitFilter);
    }

    let wrongIds: Set<string>;
    if (dueOnly) {
      const dueIds = new Set(getDueQuestionIds());
      wrongIds = new Set(wrong.map(w => w.questionId).filter(id => dueIds.has(id)));
    } else {
      wrongIds = new Set(wrong.map(w => w.questionId));
    }

    if (wrongIds.size === 0) {
      router.replace('/review');
      return;
    }

    const matched = allQuestions.filter(q => wrongIds.has(q.id));
    if (matched.length === 0) {
      router.replace('/review');
      return;
    }

    setQuestions(matched);
  }, [router, allQuestions, unitFilter, dueOnly]);

  if (!questions) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">오답 문제를 불러오는 중...</p>
      </div>
    );
  }

  return <QuizRunner unitCode="review" questions={questions} reviewMode />;
}

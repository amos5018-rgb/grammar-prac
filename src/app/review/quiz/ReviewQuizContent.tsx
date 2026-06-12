'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDedupedWrongAnswers } from '@/lib/storage';
import { Question } from '@/lib/types';
import QuizRunner from '@/components/QuizRunner';

export default function ReviewQuizContent({ allQuestions }: { allQuestions: Question[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ?unit=소단원코드 가 있으면 해당 소단원의 틀린 문제만 복습
  const unitFilter = searchParams.get('unit');
  const [questions, setQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    let wrong = getDedupedWrongAnswers();
    if (unitFilter) {
      wrong = wrong.filter(w => w.unitCode === unitFilter);
    }
    if (wrong.length === 0) {
      router.replace('/review');
      return;
    }

    const wrongIds = new Set(wrong.map(w => w.questionId));
    const matched = allQuestions.filter(q => wrongIds.has(q.id));

    if (matched.length === 0) {
      router.replace('/review');
      return;
    }

    // 순서 셔플은 QuizRunner가 담당
    setQuestions(matched);
  }, [router, allQuestions, unitFilter]);

  if (!questions) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">오답 문제를 불러오는 중...</p>
      </div>
    );
  }

  return <QuizRunner unitCode="review" questions={questions} reviewMode />;
}

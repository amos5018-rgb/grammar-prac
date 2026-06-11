'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDedupedWrongAnswers } from '@/lib/storage';
import { Question } from '@/lib/types';
import QuizRunner from '@/components/QuizRunner';

export default function ReviewQuizContent({ allQuestions }: { allQuestions: Question[] }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    const wrong = getDedupedWrongAnswers();
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

    for (let i = matched.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [matched[i], matched[j]] = [matched[j], matched[i]];
    }

    setQuestions(matched);
  }, [router, allQuestions]);

  if (!questions) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">오답 문제를 불러오는 중...</p>
      </div>
    );
  }

  return <QuizRunner unitCode="review" questions={questions} reviewMode />;
}

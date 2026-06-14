'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDedupedWrongAnswers, getDueQuestionIds, getTopWrongQuestionIds } from '@/lib/storage';
import { Question } from '@/lib/types';
import QuizRunner from '@/components/QuizRunner';

const REVIEW_BATCH = 5;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function ReviewQuizContent({ allQuestions }: { allQuestions: Question[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unitFilter = searchParams.get('unit');
  const dueOnly = searchParams.get('due') === '1';
  const wrongTop = searchParams.get('wrong') === '1';
  const [questions, setQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    let targetIds: string[];

    if (wrongTop) {
      // 오답 횟수가 많은 best 5
      targetIds = getTopWrongQuestionIds(REVIEW_BATCH);
    } else {
      let wrong = getDedupedWrongAnswers();
      if (unitFilter) {
        wrong = wrong.filter(w => w.unitCode === unitFilter);
      }
      if (dueOnly) {
        // 복습 예정 문제 중 무작위 5개
        const dueIds = new Set(getDueQuestionIds());
        const dueWrong = wrong.map(w => w.questionId).filter(id => dueIds.has(id));
        targetIds = shuffle(dueWrong).slice(0, REVIEW_BATCH);
      } else {
        targetIds = wrong.map(w => w.questionId);
      }
    }

    if (targetIds.length === 0) {
      router.replace('/review');
      return;
    }

    const byId = new Map(allQuestions.map(q => [q.id, q]));
    const matched = targetIds
      .map(id => byId.get(id))
      .filter((q): q is Question => q !== undefined);

    if (matched.length === 0) {
      router.replace('/review');
      return;
    }

    setQuestions(matched);
  }, [router, allQuestions, unitFilter, dueOnly, wrongTop]);

  if (!questions) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">오답 문제를 불러오는 중...</p>
      </div>
    );
  }

  return <QuizRunner unitCode="review" questions={questions} reviewMode />;
}

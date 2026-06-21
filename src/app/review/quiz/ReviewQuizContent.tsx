'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDedupedWrongAnswers, getDueQuestionIds, getTopWrongQuestionIds } from '@/lib/storage';
import { splitQuestions } from '@/data/questions/split';
import { Question, QuizMode } from '@/lib/types';
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
  const partParam = searchParams.get('part');
  const blockParam = searchParams.get('block');
  const dueOnly = searchParams.get('due') === '1';
  const wrongTop = searchParams.get('wrong') === '1';
  const nParam = searchParams.get('n');
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>('wrong');

  useEffect(() => {
    let targetIds: string[];
    let mode: QuizMode = 'wrong';

    if (wrongTop) {
      targetIds = getTopWrongQuestionIds(REVIEW_BATCH);
      mode = 'top-wrong';
    } else {
      let wrong = getDedupedWrongAnswers();
      if (unitFilter) {
        wrong = wrong.filter(w => w.unitCode === unitFilter);
        if (partParam != null) {
          const part = parseInt(partParam, 10);
          const parentQs = allQuestions.filter(q => q.unitCode === unitFilter);
          const partIds = new Set(splitQuestions(parentQs, part).map(q => q.id));
          wrong = wrong.filter(w => partIds.has(w.questionId));
        }
        if (blockParam) {
          const blockIds = new Set(
            allQuestions.filter(q => q.unitCode === unitFilter && q.block === blockParam).map(q => q.id)
          );
          wrong = wrong.filter(w => blockIds.has(w.questionId));
        }
      }
      if (dueOnly) {
        const dueIds = new Set(getDueQuestionIds());
        const dueWrong = wrong.map(w => w.questionId).filter(id => dueIds.has(id));
        targetIds = shuffle(dueWrong).slice(0, REVIEW_BATCH);
        mode = 'due';
      } else {
        let ids = wrong.map(w => w.questionId);
        const n = nParam ? parseInt(nParam, 10) : 0;
        if (Number.isFinite(n) && n > 0 && n < ids.length) {
          ids = shuffle(ids).slice(0, n);
          mode = 'wrong-random';
        } else {
          mode = 'wrong';
        }
        targetIds = ids;
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

    setQuizMode(mode);
    setQuestions(matched);
  }, [router, allQuestions, unitFilter, partParam, blockParam, dueOnly, wrongTop, nParam]);

  if (!questions) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">오답 문제를 불러오는 중...</p>
      </div>
    );
  }

  return <QuizRunner unitCode="review" questions={questions} reviewMode quizMode={quizMode} />;
}

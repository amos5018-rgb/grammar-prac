import { Suspense } from 'react';
import { fetchQuestions } from '@/lib/sheets';
import ReviewQuizContent from './ReviewQuizContent';

export const revalidate = 3600;

export default async function ReviewQuizPage() {
  const allQuestions = await fetchQuestions();
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-text-secondary">오답 문제를 불러오는 중...</p>
        </div>
      }
    >
      <ReviewQuizContent allQuestions={allQuestions} />
    </Suspense>
  );
}

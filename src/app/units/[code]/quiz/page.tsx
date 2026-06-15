import { Suspense } from 'react';
import { fetchUnits, fetchQuestions } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import QuizLauncher from './QuizLauncher';

// 빌드 시 퀴즈 페이지를 미리 생성하고, 5분마다 갱신 (빠른 로딩)
export const revalidate = 300;

export async function generateStaticParams() {
  const units = await fetchUnits();
  return units.map(u => ({ code: u.code }));
}

export default async function QuizPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const questions = await fetchQuestions(code);

  if (questions.length === 0) notFound();

  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-text-secondary">문제를 준비하는 중...</p>
        </div>
      }
    >
      <QuizLauncher unitCode={code} questions={questions} />
    </Suspense>
  );
}

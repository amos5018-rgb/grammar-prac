import { fetchUnits, fetchQuestions } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import QuizRunner from '@/components/QuizRunner';

// 빌드 시 퀴즈 페이지를 미리 생성하고, 5분마다 갱신 (빠른 로딩)
export const revalidate = 300;

export async function generateStaticParams() {
  const units = await fetchUnits();
  return units.map(u => ({ code: u.code }));
}

export default async function QuizPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [units, questions] = await Promise.all([fetchUnits(), fetchQuestions(code)]);

  if (questions.length === 0) notFound();

  const unit = units.find(u => u.code === code);

  return <QuizRunner unitCode={code} questions={questions} shuffleOnly={unit?.shuffleOnly} />;
}

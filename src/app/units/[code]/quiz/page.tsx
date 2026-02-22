import { fetchQuestions } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import QuizRunner from '@/components/QuizRunner';

export default async function QuizPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const questions = await fetchQuestions(code);

  if (questions.length === 0) notFound();

  return <QuizRunner unitCode={code} questions={questions} />;
}

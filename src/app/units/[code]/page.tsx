import { fetchUnits, fetchQuestions, fetchStudyCards } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import UnitDetail from './UnitDetail';

export const revalidate = 3600;

export async function generateStaticParams() {
  const units = await fetchUnits();
  return units.map(u => ({ code: u.code }));
}

export default async function UnitPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [units, questions] = await Promise.all([
    fetchUnits(),
    fetchQuestions(code),
  ]);

  const unit = units.find(u => u.code === code);
  if (!unit) notFound();

  const count = unit.study ? fetchStudyCards(code).length : questions.length;
  const questionIds = unit.study ? [] : questions.map(q => q.id);

  return <UnitDetail unit={unit} questionCount={count} questionIds={questionIds} />;
}

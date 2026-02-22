import { fetchUnits, fetchQuestions } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import UnitDetail from './UnitDetail';

export default async function UnitPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [units, questions] = await Promise.all([
    fetchUnits(),
    fetchQuestions(code),
  ]);

  const unit = units.find(u => u.code === code);
  if (!unit) notFound();

  return <UnitDetail unit={unit} questionCount={questions.length} />;
}

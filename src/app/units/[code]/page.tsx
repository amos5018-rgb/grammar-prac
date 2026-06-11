import { fetchUnits, fetchQuestions } from '@/lib/sheets';
import { notFound } from 'next/navigation';
import UnitDetail from './UnitDetail';

// 빌드 시 단원 페이지를 미리 생성하고, 5분마다 갱신 (빠른 로딩)
export const revalidate = 300;

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

  return <UnitDetail unit={unit} questionCount={questions.length} />;
}

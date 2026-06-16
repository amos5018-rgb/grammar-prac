import { fetchUnits, fetchQuestions } from '@/lib/sheets';
import { categories } from '@/data/categories';
import { notFound } from 'next/navigation';
import MixedQuizContent from './MixedQuizContent';

export const revalidate = 3600;

export async function generateStaticParams() {
  return categories.map(c => ({ code: c.code }));
}

export default async function MixedQuizPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [units, questions] = await Promise.all([fetchUnits(), fetchQuestions()]);

  const catUnits = units.filter(u => u.category === code && u.active);
  if (catUnits.length === 0) notFound();

  const catUnitCodes = new Set(catUnits.map(u => u.code));
  for (const u of catUnits) {
    if (u.parentCode) catUnitCodes.add(u.parentCode);
  }
  const catQuestions = questions.filter(q => catUnitCodes.has(q.unitCode));

  const categoryName = categories.find(c => c.code === code)?.name ?? code;

  return <MixedQuizContent questions={catQuestions} categoryCode={code} categoryName={categoryName} />;
}

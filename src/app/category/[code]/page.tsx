import { fetchUnits, fetchQuestions, fetchStudyCards } from '@/lib/sheets';
import { categories } from '@/data/categories';
import { notFound } from 'next/navigation';
import CategoryContent from './CategoryContent';

export const revalidate = 300;

export async function generateStaticParams() {
  return categories.map(c => ({ code: c.code }));
}

export default async function CategoryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [units, questions] = await Promise.all([fetchUnits(), fetchQuestions()]);

  const known = new Set(categories.map(c => c.code));
  const catUnits =
    code === 'etc'
      ? units.filter(u => !known.has(u.category))
      : units.filter(u => u.category === code);

  if (catUnits.length === 0) notFound();

  const category = categories.find(c => c.code === code) ?? {
    code: 'etc',
    name: '기타',
    description: '아직 분류되지 않은 단원입니다.',
    order: 999,
  };

  const catUnitCodes = new Set(catUnits.map(u => u.code));
  const questionCounts: Record<string, number> = {};
  let totalQuestions = 0;
  for (const q of questions) {
    questionCounts[q.unitCode] = (questionCounts[q.unitCode] || 0) + 1;
    if (catUnitCodes.has(q.unitCode)) totalQuestions++;
  }

  for (const u of catUnits) {
    if (u.study) {
      questionCounts[u.code] = fetchStudyCards(u.code).length;
    }
  }

  return <CategoryContent category={category} units={catUnits} questionCounts={questionCounts} totalQuestions={totalQuestions} />;
}

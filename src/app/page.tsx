import { fetchUnits, fetchQuestions } from '@/lib/sheets';
import HomeContent from './HomeContent';

// 정적으로 미리 생성하고 5분마다 갱신 (빠른 로딩)
export const revalidate = 300;

export default async function Home() {
  const [units, questions] = await Promise.all([fetchUnits(), fetchQuestions()]);

  const questionCounts: Record<string, number> = {};
  for (const q of questions) {
    questionCounts[q.unitCode] = (questionCounts[q.unitCode] || 0) + 1;
  }

  return <HomeContent units={units} questionCounts={questionCounts} />;
}

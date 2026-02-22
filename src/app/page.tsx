import { fetchUnits, fetchQuestions } from '@/lib/sheets';
import HomeContent from './HomeContent';

export default async function Home() {
  const units = await fetchUnits();
  const questions = await fetchQuestions();

  const questionCounts: Record<string, number> = {};
  for (const q of questions) {
    questionCounts[q.unitCode] = (questionCounts[q.unitCode] || 0) + 1;
  }

  return <HomeContent units={units} questionCounts={questionCounts} />;
}

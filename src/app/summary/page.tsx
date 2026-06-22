import { fetchUnits, fetchQuestions, fetchStudyCards } from '@/lib/sheets';
import { categories } from '@/data/categories';
import SummaryContent, { SummaryGroup } from './SummaryContent';

export const revalidate = 3600;

// 총정리 모음 메뉴에 표시할 제목 (카테고리 코드 → 제목)
const SUMMARY_TITLES: Record<string, string> = {
  'phoneme-change': '음운 변동 총정리',
  'grammar-elements': '문법 요소 총정리',
};

export default async function SummaryPage() {
  const [units, questions] = await Promise.all([fetchUnits(), fetchQuestions()]);

  const questionCounts: Record<string, number> = {};
  for (const q of questions) {
    questionCounts[q.unitCode] = (questionCounts[q.unitCode] || 0) + 1;
  }

  const summaryUnits = units.filter(u => u.summary);
  for (const u of summaryUnits) {
    if (u.study) questionCounts[u.code] = fetchStudyCards(u.code).length;
  }

  const groups: SummaryGroup[] = [...categories]
    .sort((a, b) => a.order - b.order)
    .map(cat => ({
      categoryCode: cat.code,
      title: SUMMARY_TITLES[cat.code] ?? `${cat.name} 총정리`,
      units: summaryUnits.filter(u => u.category === cat.code),
    }))
    .filter(g => g.units.length > 0);

  return <SummaryContent groups={groups} questionCounts={questionCounts} />;
}

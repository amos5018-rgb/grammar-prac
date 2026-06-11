import { fetchUnits, fetchQuestions } from '@/lib/sheets';
import { categories } from '@/data/categories';
import HomeContent, { CategoryCardData } from './HomeContent';

// 정적으로 미리 생성하고 5분마다 갱신 (빠른 로딩)
export const revalidate = 300;

export default async function Home() {
  const [units, questions] = await Promise.all([fetchUnits(), fetchQuestions()]);

  const questionCounts: Record<string, number> = {};
  for (const q of questions) {
    questionCounts[q.unitCode] = (questionCounts[q.unitCode] || 0) + 1;
  }

  const known = new Set(categories.map(c => c.code));
  const cards: CategoryCardData[] = [...categories]
    .sort((a, b) => a.order - b.order)
    .map(cat => {
      const catUnits = units.filter(u => u.category === cat.code);
      return {
        code: cat.code,
        name: cat.name,
        description: cat.description,
        unitCount: catUnits.length,
        questionCount: catUnits.reduce((sum, u) => sum + (questionCounts[u.code] || 0), 0),
        unitCodes: catUnits.map(u => u.code),
      };
    })
    .filter(c => c.unitCount > 0);

  // 등록되지 않은 중분류 코드의 단원은 '기타'로 묶음
  const leftover = units.filter(u => !known.has(u.category));
  if (leftover.length > 0) {
    cards.push({
      code: 'etc',
      name: '기타',
      description: '아직 분류되지 않은 단원입니다.',
      unitCount: leftover.length,
      questionCount: leftover.reduce((sum, u) => sum + (questionCounts[u.code] || 0), 0),
      unitCodes: leftover.map(u => u.code),
    });
  }

  return <HomeContent categories={cards} />;
}

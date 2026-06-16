import { fetchUnits } from '@/lib/sheets';
import { categories } from '@/data/categories';
import { questionCountMap } from '@/data/questions/question-id-map';
import HomeContent, { CategoryCardData } from './HomeContent';

export const revalidate = 3600;

export default async function Home() {
  const units = await fetchUnits();

  const questionCounts = questionCountMap;

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

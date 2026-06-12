import { getUnitProgress, getDueCount } from './storage';
import { units } from '@/data/units';

export interface Recommendation {
  type: 'review' | 'retry' | 'new';
  title: string;
  subtitle: string;
  href: string;
}

export function getRecommendation(): Recommendation | null {
  const dueCount = getDueCount();
  if (dueCount > 0) {
    return {
      type: 'review',
      title: `복습할 문제 ${dueCount}개`,
      subtitle: '간격 반복 복습으로 장기 기억을 만들어요',
      href: '/review/quiz?due=1',
    };
  }

  const progress = getUnitProgress();
  const activeUnits = units.filter(u => u.active && !u.advanced && !u.summary);

  const weakUnit = activeUnits
    .filter(u => {
      const p = progress[u.code];
      return p && p.bestScore !== null && p.bestScore < 80;
    })
    .sort((a, b) => (progress[a.code].bestScore ?? 0) - (progress[b.code].bestScore ?? 0))[0];

  if (weakUnit) {
    return {
      type: 'retry',
      title: `'${weakUnit.name}' 재도전`,
      subtitle: `최고 점수 ${progress[weakUnit.code].bestScore}% — 80% 이상을 목표로!`,
      href: `/units/${weakUnit.code}`,
    };
  }

  const nextUnit = activeUnits
    .sort((a, b) => a.order - b.order)
    .find(u => !progress[u.code]);

  if (nextUnit) {
    return {
      type: 'new',
      title: `'${nextUnit.name}' 시작하기`,
      subtitle: '아직 학습하지 않은 단원이에요',
      href: `/units/${nextUnit.code}`,
    };
  }

  return null;
}

import { getUnitProgress, getDueCount, getUnitTierMap, getDday, getStudyCompletion, UnitTier } from './storage';
import { units } from '@/data/units';

type TierMap = Record<string, UnitTier>;

export type RecommendationType = 'review' | 'retry' | 'master-push' | 'new' | 'summary' | 'study' | 'advanced' | 'done';

export interface Recommendation {
  type: RecommendationType;
  title: string;
  subtitle: string;
  href: string;
  urgent?: boolean;
}

const CORE = units.filter(u => u.active && !u.advanced && !u.summary).sort((a, b) => a.order - b.order);
const ADVANCED_UNITS = units.filter(u => u.advanced && u.active).sort((a, b) => a.order - b.order);
const SUMMARY_QUIZ = 'phoneme-change-review';
const SUMMARY_STUDY = 'phoneme-change-study';
const DDAY_URGENT = 5;

export function getRecommendation(): Recommendation | null {
  const dday = getDday();
  const urgent = dday > 0 && dday <= DDAY_URGENT;

  // 1. review — 복습 대상 최우선
  const dueCount = getDueCount();
  if (dueCount > 0) {
    return {
      type: 'review',
      title: `복습할 문제 ${dueCount}개`,
      subtitle: urgent
        ? `시험이 ${dday}일 남았어요 — 틀린 문제부터 다지세요`
        : '간격 반복 복습으로 장기 기억을 만들어요',
      href: '/review/quiz?due=1',
      urgent,
    };
  }

  const progress = getUnitProgress();
  const tiers = getUnitTierMap();

  // 2. retry — 약점 핵심 단원 (<80%)
  const weakUnit = CORE
    .filter(u => {
      const p = progress[u.code];
      return p && p.bestScore !== null && p.bestScore < 80;
    })
    .sort((a, b) => (progress[a.code].bestScore ?? 0) - (progress[b.code].bestScore ?? 0))[0];

  if (weakUnit) {
    const best = progress[weakUnit.code].bestScore;
    return {
      type: 'retry',
      title: `'${weakUnit.name}' 재도전`,
      subtitle: urgent
        ? `D-${dday} · 최고 ${best}% — 약한 단원부터 끌어올리세요`
        : `최고 점수 ${best}% — 80% 이상을 목표로!`,
      href: `/units/${weakUnit.code}`,
      urgent,
    };
  }

  // 3·4. new ↔ master-push (urgent면 new 먼저, 아니면 master-push 먼저)
  const newRec = getNewRecommendation(progress, dday, urgent);
  const masterPushRec = getMasterPushRecommendation(progress, tiers, dday, urgent);

  const first = urgent ? (newRec ?? masterPushRec) : (masterPushRec ?? newRec);
  if (first) return first;

  // 5. summary — 총정리 문제편
  if (!tiers[SUMMARY_QUIZ]?.mastered) {
    return {
      type: 'summary',
      title: '음운 변동 총정리에 도전',
      subtitle: urgent
        ? `D-${dday} · 총정리로 실전 감각을 끌어올리세요`
        : '핵심 단원을 마스터했어요! 변동 과정을 통합 분석해 보세요',
      href: `/units/${SUMMARY_QUIZ}`,
      urgent,
    };
  }

  // 6. study — 복습편 인출 연습 (urgent면 건너뜀)
  if (!urgent && getStudyCompletion(SUMMARY_STUDY).count < 2) {
    return {
      type: 'study',
      title: '음운 변동 복습편으로 인출 연습',
      subtitle: '개념을 스스로 떠올리며 장기 기억으로 굳혀요',
      href: `/units/${SUMMARY_STUDY}/study`,
    };
  }

  // 7. advanced — 고난도 도전
  const nextAdvanced = ADVANCED_UNITS.find(u => !tiers[u.code]?.mastered);
  if (nextAdvanced) {
    return {
      type: 'advanced',
      title: `'${nextAdvanced.name}'에 도전`,
      subtitle: urgent
        ? `D-${dday} · 고난도 통합 문제로 마무리 점검`
        : '핵심을 끝냈어요 — 수능형 고난도 문제로 실력을 검증하세요',
      href: `/units/${nextAdvanced.code}`,
      urgent,
    };
  }

  // 8. done — 완주 축하
  return {
    type: 'done',
    title: dday > 0 ? '모든 단원 마스터 완료! \u{1F451}' : '수고했어요! \u{1F389}',
    subtitle: dday > 0
      ? `D-${dday} · 복습으로 컨디션을 유지하세요`
      : '모든 학습을 마쳤어요',
    href: '/progress',
  };
}

function getNewRecommendation(
  progress: Record<string, { attempts: number; bestScore: number | null }>,
  dday: number,
  urgent: boolean,
): Recommendation | null {
  const nextUnit = CORE
    .find(u => !progress[u.code] || progress[u.code].bestScore === null);

  if (!nextUnit) return null;
  return {
    type: 'new',
    title: `'${nextUnit.name}' 시작하기`,
    subtitle: urgent
      ? `D-${dday} · 아직 안 푼 단원이에요 — 지금 시작하세요`
      : '아직 학습하지 않은 단원이에요',
    href: `/units/${nextUnit.code}`,
    urgent,
  };
}

function getMasterPushRecommendation(
  progress: Record<string, { attempts: number; bestScore: number | null }>,
  tiers: TierMap,
  dday: number,
  urgent: boolean,
): Recommendation | null {
  const skilledUnit = CORE
    .filter(u => tiers[u.code]?.level === 'skilled')
    .sort((a, b) => (progress[b.code]?.bestScore ?? 0) - (progress[a.code]?.bestScore ?? 0))[0];

  if (!skilledUnit) return null;

  const best = progress[skilledUnit.code]?.bestScore ?? 0;
  const needsScore = best < 90;
  const prefix = urgent ? `D-${dday} · ` : '';

  return {
    type: 'master-push',
    title: `'${skilledUnit.name}' 마스터 도전`,
    subtitle: needsScore
      ? `${prefix}최고 ${best}% — 90% 이상이면 마스터예요!`
      : `${prefix}다른 날 한 번 더 90% 이상이면 마스터! \u{1F451}`,
    href: `/units/${skilledUnit.code}`,
    urgent,
  };
}

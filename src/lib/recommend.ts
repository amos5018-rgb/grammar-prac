import { getUnitProgress, getDueCount, getWrongCounts, getUnitTierMap, getCorrectQuestionIds, getDday, getStudyCompletion, CONVERT_COVERAGE, UnitTier } from './storage';
import { units } from '@/data/units';
import { questionIdMap } from '@/data/questions/question-id-map';

type TierMap = Record<string, UnitTier>;
type Progress = Record<string, { attempts: number; bestScore: number | null }>;

export type RecommendationType = 'review' | 'wrong-top' | 'retry' | 'full-challenge' | 'master-push' | 'new' | 'summary' | 'study' | 'advanced' | 'done';

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
const REVIEW_BATCH = 5;

export function getRecommendation(): Recommendation | null {
  const dday = getDday();
  const urgent = dday > 0 && dday <= DDAY_URGENT;
  const progress = getUnitProgress();
  const tiers = getUnitTierMap();

  // ── 1~5위: 단조로움 방지를 위해 적용 가능한 추천을 모아 랜덤으로 하나 노출 ──
  const pool: Recommendation[] = [];

  // 1. review — 복습 예정 문제 중 무작위 5개
  const dueCount = getDueCount();
  if (dueCount > 0) {
    const n = Math.min(REVIEW_BATCH, dueCount);
    pool.push({
      type: 'review',
      title: '부담 없는 5문제 복습',
      subtitle: urgent
        ? `D-${dday} · 복습 예정 ${dueCount}개 중 ${n}개만 가볍게`
        : `복습 예정 ${dueCount}개 중 ${n}개를 무작위로 풀어요`,
      href: '/review/quiz?due=1',
      urgent,
    });
  }

  // 2. wrong-top — 오답 횟수가 많은 문제 best 5
  const wrongCounts = getWrongCounts();
  const wrongTotal = Object.keys(wrongCounts).length;
  const maxWrong = wrongTotal > 0 ? Math.max(...Object.values(wrongCounts)) : 0;
  if (maxWrong >= 2) {
    const n = Math.min(REVIEW_BATCH, wrongTotal);
    pool.push({
      type: 'wrong-top',
      title: '자주 틀린 문제 집중 복습',
      subtitle: urgent
        ? `D-${dday} · 가장 많이 틀린 ${n}문제로 약점 해결`
        : `가장 많이 틀린 ${n}문제를 모았어요 — 약점을 콕 집어요`,
      href: '/review/quiz?wrong=1',
      urgent,
    });
  }

  // 3. retry — 약점 핵심 단원 (<80%)
  const retryRec = getRetryRecommendation(progress, dday, urgent);
  if (retryRec) pool.push(retryRec);

  // 4. new — 아직 안 푼 단원
  const newRec = getNewRecommendation(progress, dday, urgent);
  if (newRec) pool.push(newRec);

  // 5. master-push — 숙련자 단원 마스터 도전
  const masterPushRec = getMasterPushRecommendation(progress, tiers, dday, urgent);
  if (masterPushRec) pool.push(masterPushRec);

  // 5+. full-challenge — 전환 훅: 숙련자를 '전부 풀기'로 마스터 도전 유도
  const fullChallengeRec = getFullChallengeRecommendation(tiers, dday, urgent);
  if (fullChallengeRec) pool.push(fullChallengeRec);

  if (pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ── 6위 이하: 순차 폴백 ──

  // 6. summary — 총정리 문제편
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

  // 7. study — 복습편 인출 연습 (urgent면 건너뜀)
  if (!urgent && getStudyCompletion(SUMMARY_STUDY).count < 2) {
    return {
      type: 'study',
      title: '음운 변동 복습편으로 인출 연습',
      subtitle: '개념을 스스로 떠올리며 장기 기억으로 굳혀요',
      href: `/units/${SUMMARY_STUDY}/study`,
    };
  }

  // 8. advanced — 고난도 도전
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

  // 9. done — 완주 축하
  return {
    type: 'done',
    title: dday > 0 ? '모든 단원 마스터 완료! \u{1F451}' : '수고했어요! \u{1F389}',
    subtitle: dday > 0
      ? `D-${dday} · 복습으로 컨디션을 유지하세요`
      : '모든 학습을 마쳤어요',
    href: '/progress',
  };
}

function getRetryRecommendation(
  progress: Progress,
  dday: number,
  urgent: boolean,
): Recommendation | null {
  const weakUnit = CORE
    .filter(u => {
      const p = progress[u.code];
      return p && p.bestScore !== null && p.bestScore < 80;
    })
    .sort((a, b) => (progress[a.code].bestScore ?? 0) - (progress[b.code].bestScore ?? 0))[0];

  if (!weakUnit) return null;

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

function getNewRecommendation(
  progress: Progress,
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
  progress: Progress,
  tiers: TierMap,
  dday: number,
  urgent: boolean,
): Recommendation | null {
  const skilledUnit = CORE
    .filter(u => tiers[u.code]?.level === 'skilled')
    .sort((a, b) => (progress[b.code]?.bestScore ?? 0) - (progress[a.code]?.bestScore ?? 0))[0];

  if (!skilledUnit) return null;

  const prefix = urgent ? `D-${dday} · ` : '';

  return {
    type: 'master-push',
    title: `'${skilledUnit.name}' 마스터 도전`,
    subtitle: `${prefix}전부 풀기 100%를 달성하면 마스터! \u{1F451}`,
    href: `/units/${skilledUnit.code}`,
    urgent,
  };
}

// 전환 훅: 숙련자이지만 마스터 미달성인 핵심 단원을 '전부 풀기'로 유도
function getFullChallengeRecommendation(
  tiers: TierMap,
  dday: number,
  urgent: boolean,
): Recommendation | null {
  const correct = getCorrectQuestionIds();
  let best: { name: string; code: string; pct: number } | null = null;
  for (const u of CORE) {
    const t = tiers[u.code];
    if (!t || t.level !== 'skilled' || t.mastered) continue;
    const ids = questionIdMap[u.code] ?? [];
    if (ids.length === 0) continue;
    const cov = ids.filter(id => correct.has(id)).length / ids.length;
    if (cov >= CONVERT_COVERAGE && (!best || cov > best.pct)) {
      best = { name: u.name, code: u.code, pct: cov };
    }
  }
  if (!best) return null;

  return {
    type: 'full-challenge',
    title: `'${best.name}' 전부 풀기로 마스터 도전`,
    subtitle: urgent
      ? `D-${dday} · 진행도 ${Math.round(best.pct * 100)}% — 전부 풀기 100%면 마스터!`
      : `진행도 ${Math.round(best.pct * 100)}%까지 왔어요 — 전부 풀기 100%면 마스터!`,
    href: `/units/${best.code}/quiz`,
    urgent,
  };
}

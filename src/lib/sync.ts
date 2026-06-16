import {
  getClientId,
  getProfile,
  getQuizResults,
  getStreak,
  getActivityDates,
} from './storage';
import { questionCountMap } from '@/data/questions/question-id-map';

const PENDING_KEY = 'grammar_sync_pending';
const LAST_SYNC_KEY = 'grammar_sync_last';

export interface SyncSnapshot {
  clientId: string;
  profile: { name: string; studentId: string };
  streak: number;
  activityDates: string[];
  unitTiers: Record<string, { level: string; label: string; mastered: boolean; bestScore: number | null }>;
  unitProgress: Record<string, { attempts: number; bestScore: number | null }>;
  attempts: Array<{
    attemptId: string;
    unitCode: string;
    date: string;
    answers: Array<{
      questionId: string;
      questionText: string;
      correct: boolean;
      studentAnswer: string;
      correctAnswer: string;
      unitCode: string;
    }>;
  }>;
}

// 레거시(attemptId 없는) 기록용 결정적 해시 폴백
function fallbackAttemptId(unitCode: string, date: string, total: number): string {
  return `legacy:${date}|${unitCode}|${total}`;
}

const TIER_LABELS: Record<string, { label: string }> = {
  beginner:   { label: '비기너' },
  challenger: { label: '도전자' },
  trainee:    { label: '유망주' },
  skilled:    { label: '숙련자' },
  master:     { label: '마스터' },
};

export function buildSnapshot(): SyncSnapshot | null {
  if (typeof window === 'undefined') return null;
  const profile = getProfile();
  if (!profile) return null;

  const results = getQuizResults();

  const unitData: Record<string, {
    attempts: number;
    bestScore: number | null;
    hasAny: boolean;
    fullBest: number | null;
    correctIds: Set<string>;
    totalCorrect: number;
    totalAnswered: number;
  }> = {};
  for (const r of results) {
    let entry = unitData[r.unitCode];
    if (!entry) {
      entry = { attempts: 0, bestScore: null, hasAny: false, fullBest: null, correctIds: new Set(), totalCorrect: 0, totalAnswered: 0 };
      unitData[r.unitCode] = entry;
    }
    entry.attempts++;
    if (r.completed !== false) {
      entry.hasAny = true;
      const pct = Math.round((r.score / r.total) * 100);
      if (entry.bestScore === null || pct > entry.bestScore) entry.bestScore = pct;
      for (const a of r.answers) {
        entry.totalAnswered++;
        if (a.correct) {
          entry.totalCorrect++;
          entry.correctIds.add(a.questionId);
        }
      }
      if (r.full !== false) {
        if (entry.fullBest === null || pct > entry.fullBest) entry.fullBest = pct;
      }
    }
  }

  const unitTiers: SyncSnapshot['unitTiers'] = {};
  const unitProgress: SyncSnapshot['unitProgress'] = {};
  for (const [code, d] of Object.entries(unitData)) {
    unitProgress[code] = { attempts: d.attempts, bestScore: d.bestScore };
    const qCount = questionCountMap[code] ?? 0;
    let level: string;
    let mastered = false;
    const hasCov = qCount > 0 && d.totalAnswered > 0;
    const coverage = hasCov ? d.correctIds.size / qCount : 0;
    const accuracy = hasCov ? Math.round((d.totalCorrect / d.totalAnswered) * 100) : 0;
    if (!d.hasAny) {
      level = 'beginner';
    } else if (d.fullBest !== null && d.fullBest >= 100) {
      level = 'master';
      mastered = true;
    } else if (d.fullBest !== null && d.fullBest >= 80) {
      level = 'skilled';
    } else if (hasCov && coverage >= 0.8 && accuracy >= 80) {
      level = 'skilled';
    } else if (d.fullBest !== null && d.fullBest >= 60) {
      level = 'trainee';
    } else if (hasCov && coverage >= 0.5 && accuracy >= 60) {
      level = 'trainee';
    } else {
      level = 'challenger';
    }
    unitTiers[code] = { level, label: TIER_LABELS[level].label, mastered, bestScore: d.bestScore };
  }

  const attempts = results.map(r => ({
    attemptId: r.attemptId ?? fallbackAttemptId(r.unitCode, r.date, r.total),
    unitCode: r.unitCode,
    date: r.date,
    answers: r.answers.map(a => ({
      questionId: a.questionId,
      questionText: a.questionText ?? '',
      correct: a.correct,
      studentAnswer: a.studentAnswer ?? '',
      correctAnswer: a.correctAnswer ?? '',
      unitCode: a.unitCode ?? r.unitCode,
    })),
  }));

  return {
    clientId: getClientId(),
    profile: { name: profile.name, studentId: profile.studentId },
    streak: getStreak(),
    activityDates: getActivityDates(),
    unitTiers,
    unitProgress,
    attempts,
  };
}

export async function syncNow(): Promise<void> {
  if (typeof window === 'undefined') return;
  const snapshot = buildSnapshot();
  if (!snapshot) return;

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
      keepalive: true,
    });
    if (!res.ok) throw new Error(`sync failed: ${res.status}`);
    localStorage.removeItem(PENDING_KEY);
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch {
    // 실패 시 보류 플래그 → 다음 로드/온라인 시 재시도
    localStorage.setItem(PENDING_KEY, '1');
  }
}

export function hasPendingSync(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PENDING_KEY) === '1';
}

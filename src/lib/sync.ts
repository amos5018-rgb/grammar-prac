import {
  getClientId,
  getProfile,
  getQuizResults,
  getStreak,
  getActivityDates,
  getUnitProgress,
  getUnitTier,
} from './storage';

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

export function buildSnapshot(): SyncSnapshot | null {
  if (typeof window === 'undefined') return null;
  const profile = getProfile();
  if (!profile) return null;

  const results = getQuizResults();
  const progress = getUnitProgress();

  const unitTiers: SyncSnapshot['unitTiers'] = {};
  for (const code of Object.keys(progress)) {
    const tier = getUnitTier(code);
    unitTiers[code] = {
      level: tier.level,
      label: tier.label,
      mastered: tier.mastered,
      bestScore: progress[code].bestScore,
    };
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
    unitProgress: progress,
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

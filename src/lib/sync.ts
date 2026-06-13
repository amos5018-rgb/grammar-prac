import {
  getClientId,
  getProfile,
  getQuizResults,
  getStreak,
  getActivityDates,
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

const TIER_LABELS: Record<string, { label: string }> = {
  beginner:   { label: '비기너' },
  challenger: { label: '도전자' },
  skilled:    { label: '숙련자' },
  master:     { label: '마스터' },
};

export function buildSnapshot(): SyncSnapshot | null {
  if (typeof window === 'undefined') return null;
  const profile = getProfile();
  if (!profile) return null;

  const results = getQuizResults();

  // 한 번의 순회로 progress + tier 정보를 동시에 계산
  const unitData: Record<string, { attempts: number; bestScore: number | null; dates: Set<string> }> = {};
  for (const r of results) {
    let entry = unitData[r.unitCode];
    if (!entry) {
      entry = { attempts: 0, bestScore: null, dates: new Set() };
      unitData[r.unitCode] = entry;
    }
    entry.attempts++;
    if (r.completed !== false) {
      const pct = Math.round((r.score / r.total) * 100);
      if (entry.bestScore === null || pct > entry.bestScore) entry.bestScore = pct;
      entry.dates.add(r.date.split('T')[0]);
    }
  }

  const unitTiers: SyncSnapshot['unitTiers'] = {};
  const unitProgress: SyncSnapshot['unitProgress'] = {};
  for (const [code, d] of Object.entries(unitData)) {
    unitProgress[code] = { attempts: d.attempts, bestScore: d.bestScore };
    let level: string;
    let mastered = false;
    if (d.bestScore === null) {
      level = 'beginner';
    } else if (d.bestScore >= 90 && d.dates.size >= 2) {
      level = 'master';
      mastered = true;
    } else if (d.bestScore >= 80) {
      level = 'skilled';
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

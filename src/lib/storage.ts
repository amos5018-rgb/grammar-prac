import { StudentProfile, QuizAttempt, AnswerRecord, ReviewScheduleEntry } from './types';

const PROFILE_KEY = 'grammar_student_profile';
const RESULTS_KEY = 'grammar_quiz_results';
const LAST_RESULT_KEY = 'grammar_last_result';
const RESOLVED_KEY = 'grammar_resolved_questions';
const REVIEW_SCHEDULE_KEY = 'grammar_review_schedule';
const ACTIVITY_KEY = 'grammar_activity_dates';
const MIGRATED_KEY = 'grammar_review_migrated';

export type WrongAnswerRecord = AnswerRecord & { unitCode: string; date: string };

// ── 날짜 유틸 ──

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function dateOffset(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ── 프로필 ──

export function getProfile(): StudentProfile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveProfile(profile: StudentProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

// ── 퀴즈 결과 ──

export function getQuizResults(): QuizAttempt[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(RESULTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveQuizResult(result: QuizAttempt) {
  const results = getQuizResults();
  results.push(result);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));

  // 틀린 문제 → 복습 스케줄에 등록 (box=1, due=내일)
  const schedule = getReviewSchedule();
  for (const answer of result.answers) {
    if (!answer.correct) {
      const qid = answer.questionId;
      const uc = answer.unitCode ?? result.unitCode;
      if (schedule[qid]) {
        schedule[qid].box = 1;
        schedule[qid].due = dateOffset(getToday(), 1);
        schedule[qid].wrongCount++;
      } else {
        schedule[qid] = { box: 1, due: dateOffset(getToday(), 1), wrongCount: 1, unitCode: uc };
      }
    }
  }
  localStorage.setItem(REVIEW_SCHEDULE_KEY, JSON.stringify(schedule));

  recordActivity();
}

export function getLastQuizResult(): QuizAttempt | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(LAST_RESULT_KEY);
  return data ? JSON.parse(data) : null;
}

export function getBestScore(unitCode: string): number | null {
  const results = getQuizResults().filter(
    r => r.unitCode === unitCode && r.completed !== false
  );
  if (results.length === 0) return null;
  return Math.max(...results.map(r => Math.round((r.score / r.total) * 100)));
}

export function getUnitAttemptCount(unitCode: string): number {
  return getQuizResults().filter(r => r.unitCode === unitCode).length;
}

// ── 간격 반복 복습 스케줄 (라이트너 박스) ──

export function getReviewSchedule(): Record<string, ReviewScheduleEntry> {
  if (typeof window === 'undefined') return {};
  migrateToReviewSchedule();
  const data = localStorage.getItem(REVIEW_SCHEDULE_KEY);
  return data ? JSON.parse(data) : {};
}

export function updateReviewState(questionId: string, correct: boolean) {
  const schedule = getReviewSchedule();
  const entry = schedule[questionId];
  if (!entry) return;

  if (correct) {
    const nextBox = entry.box + 1;
    if (nextBox > 3) {
      delete schedule[questionId];
    } else {
      entry.box = nextBox;
      const intervals = [0, 1, 3, 7];
      entry.due = dateOffset(getToday(), intervals[nextBox]);
    }
  } else {
    entry.box = 1;
    entry.due = dateOffset(getToday(), 1);
    entry.wrongCount++;
  }

  localStorage.setItem(REVIEW_SCHEDULE_KEY, JSON.stringify(schedule));
  recordActivity();
}

export function getDueCount(): number {
  const schedule = getReviewSchedule();
  const today = getToday();
  return Object.values(schedule).filter(e => e.due <= today).length;
}

export function getDueQuestionIds(): string[] {
  const schedule = getReviewSchedule();
  const today = getToday();
  return Object.entries(schedule)
    .filter(([, e]) => e.due <= today)
    .map(([id]) => id);
}

// ── 오답 노트 ──

export function getResolvedQuestionIds(): string[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(RESOLVED_KEY);
  return data ? JSON.parse(data) : [];
}

export function getAllWrongAnswers(): WrongAnswerRecord[] {
  const results = getQuizResults();
  const schedule = getReviewSchedule();
  const inSchedule = new Set(Object.keys(schedule));
  const wrong: WrongAnswerRecord[] = [];
  for (const result of results) {
    for (const answer of result.answers) {
      if (!answer.correct && inSchedule.has(answer.questionId)) {
        wrong.push({ ...answer, unitCode: answer.unitCode ?? result.unitCode, date: result.date });
      }
    }
  }
  return wrong;
}

export function getDedupedWrongAnswers(): WrongAnswerRecord[] {
  return getAllWrongAnswers().reduce<WrongAnswerRecord[]>((acc, curr) => {
    const existing = acc.findIndex(a => a.questionId === curr.questionId);
    if (existing >= 0) {
      if (curr.date > acc[existing].date) acc[existing] = curr;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);
}

export function getWrongCounts(): Record<string, number> {
  const schedule = getReviewSchedule();
  const counts: Record<string, number> = {};
  for (const [qid, entry] of Object.entries(schedule)) {
    counts[qid] = entry.wrongCount;
  }
  return counts;
}

// ── 단원 마스터 ──

export function getUnitMastery(unitCode: string): { mastered: boolean; hint?: string } {
  const results = getQuizResults().filter(r => r.unitCode === unitCode && r.completed !== false);
  if (results.length === 0) return { mastered: false };

  const bestScore = Math.max(...results.map(r => Math.round((r.score / r.total) * 100)));
  if (bestScore < 90) return { mastered: false, hint: `최고 점수 ${bestScore}% → 90% 이상 필요` };

  const dates = new Set(results.map(r => r.date.split('T')[0]));
  if (dates.size < 2) return { mastered: false, hint: '다른 날 한 번 더 도전하면 마스터!' };

  return { mastered: true };
}

// ── 학습 스트릭 ──

export function recordActivity() {
  const dates = getActivityDates();
  const today = getToday();
  if (dates.includes(today)) return;
  dates.push(today);
  const cutoff = dateOffset(today, -90);
  const filtered = dates.filter(d => d >= cutoff);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(filtered));
}

export function getActivityDates(): string[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ACTIVITY_KEY);
  return data ? JSON.parse(data) : [];
}

export function getStreak(): number {
  const dates = new Set(getActivityDates());
  if (dates.size === 0) return 0;
  const today = getToday();

  let start = today;
  if (!dates.has(today)) {
    const yesterday = dateOffset(today, -1);
    if (!dates.has(yesterday)) return 0;
    start = yesterday;
  }

  let streak = 0;
  let current = start;
  while (dates.has(current)) {
    streak++;
    current = dateOffset(current, -1);
  }
  return streak;
}

export function getRecentWeekDates(): { date: string; active: boolean }[] {
  const dates = new Set(getActivityDates());
  const today = getToday();
  const week: { date: string; active: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = dateOffset(today, -i);
    week.push({ date: d, active: dates.has(d) });
  }
  return week;
}

// ── 진도 ──

export function getUnitProgress(): Record<string, { attempts: number; bestScore: number | null }> {
  const results = getQuizResults();
  const progress: Record<string, { attempts: number; bestScore: number | null }> = {};
  for (const result of results) {
    if (!progress[result.unitCode]) {
      progress[result.unitCode] = { attempts: 0, bestScore: null };
    }
    const entry = progress[result.unitCode];
    entry.attempts++;
    if (result.completed !== false) {
      const pct = Math.round((result.score / result.total) * 100);
      if (entry.bestScore === null || pct > entry.bestScore) {
        entry.bestScore = pct;
      }
    }
  }
  return progress;
}

// ── 초기화 ──

export function clearAllHistory() {
  localStorage.removeItem(RESULTS_KEY);
  localStorage.removeItem(LAST_RESULT_KEY);
  localStorage.removeItem(RESOLVED_KEY);
  localStorage.removeItem(REVIEW_SCHEDULE_KEY);
  localStorage.removeItem(ACTIVITY_KEY);
  localStorage.removeItem(MIGRATED_KEY);
  clearProfile();
}

// ── 마이그레이션: 기존 RESOLVED_KEY → 복습 스케줄 ──

function migrateToReviewSchedule() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(MIGRATED_KEY) === '1') return;

  const resolvedSet = new Set(getResolvedQuestionIds());
  const results = getQuizResults();
  const wrongMap = new Map<string, string>();
  for (const result of results) {
    for (const answer of result.answers) {
      if (!answer.correct) {
        wrongMap.set(answer.questionId, answer.unitCode ?? result.unitCode);
      }
    }
  }

  const schedule: Record<string, ReviewScheduleEntry> = {};
  const today = getToday();
  for (const [qid, unitCode] of wrongMap) {
    if (!resolvedSet.has(qid)) {
      schedule[qid] = { box: 1, due: today, wrongCount: 1, unitCode };
    }
  }

  localStorage.setItem(REVIEW_SCHEDULE_KEY, JSON.stringify(schedule));
  localStorage.setItem(MIGRATED_KEY, '1');
}

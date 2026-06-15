import { StudentProfile, QuizAttempt, AnswerRecord, ReviewScheduleEntry } from './types';

const PROFILE_KEY = 'grammar_student_profile';
const RESULTS_KEY = 'grammar_quiz_results';
const LAST_RESULT_KEY = 'grammar_last_result';
const RESOLVED_KEY = 'grammar_resolved_questions';
const REVIEW_SCHEDULE_KEY = 'grammar_review_schedule';
const ACTIVITY_KEY = 'grammar_activity_dates';
const MIGRATED_KEY = 'grammar_review_migrated';
const CLIENT_ID_KEY = 'grammar_client_id';

export type WrongAnswerRecord = AnswerRecord & { unitCode: string; date: string };

// ── 기기 식별자 (서버 동기화용, clearAllHistory로 지워지지 않음) ──

export function getClientId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

// 학생 데이터를 서버로 동기화 (fire-and-forget, 학생 흐름에 영향 없음)
let syncInFlight = false;
function triggerSync() {
  if (typeof window === 'undefined' || syncInFlight) return;
  syncInFlight = true;
  import('./sync')
    .then(m => m.syncNow())
    .catch(() => {})
    .finally(() => { syncInFlight = false; });
}

// ── 날짜 유틸 (로컬 타임존 기준) ──

function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getToday(): string {
  return formatLocalDate(new Date());
}

function dateOffset(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return formatLocalDate(new Date(y, m - 1, d + days));
}

// ── 프로필 ──

export function getProfile(): StudentProfile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveProfile(profile: StudentProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  triggerSync();
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
  if (!result.attemptId) {
    result.attemptId = crypto?.randomUUID?.() ?? `${result.date}-${Math.random().toString(36).slice(2)}`;
  }
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
  triggerSync();
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

// 오답 횟수가 많은 순으로 문항 id 반환 (최다 오답 best N)
export function getTopWrongQuestionIds(limit: number): string[] {
  const schedule = getReviewSchedule();
  return Object.entries(schedule)
    .sort(([idA, a], [idB, b]) => b.wrongCount - a.wrongCount || idA.localeCompare(idB))
    .slice(0, limit)
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
  const map = new Map<string, WrongAnswerRecord>();
  for (const item of getAllWrongAnswers()) {
    const existing = map.get(item.questionId);
    if (!existing || item.date > existing.date) {
      map.set(item.questionId, item);
    }
  }
  return Array.from(map.values());
}

export function getWrongCounts(): Record<string, number> {
  const schedule = getReviewSchedule();
  const counts: Record<string, number> = {};
  for (const [qid, entry] of Object.entries(schedule)) {
    counts[qid] = entry.wrongCount;
  }
  return counts;
}

// ── 단원 칭호 ──

export type TierLevel = 'beginner' | 'challenger' | 'skilled' | 'master';

export interface UnitTier {
  level: TierLevel;
  label: string;
  emoji: string;
  mastered: boolean;
  hint?: string;
}

const TIERS: Record<TierLevel, { label: string; emoji: string }> = {
  beginner:   { label: '비기너',  emoji: '\u{1F331}' },
  challenger: { label: '도전자',  emoji: '⭐' },
  skilled:    { label: '숙련자',  emoji: '\u{1F4AA}' },
  master:     { label: '마스터',  emoji: '\u{1F451}' },
};

// 단원 집계: 승급(숙련자/마스터)은 '전부 풀기' 결과로만, 도전자는 임의 완료로 진입
interface UnitAgg {
  hasAny: boolean;            // 임의 완료 결과 존재 (도전자 진입 기준)
  fullBest: number | null;    // 전부 풀기 결과의 최고 %
  fullDays: Set<string>;      // 전부 풀기 결과의 서로 다른 날
}

function emptyAgg(): UnitAgg {
  return { hasAny: false, fullBest: null, fullDays: new Set() };
}

function accumulate(agg: UnitAgg, r: QuizAttempt) {
  if (r.completed === false) return;
  agg.hasAny = true;
  // 레거시(full undefined)는 기능 도입 전이라 전부 풀기로 간주
  if (r.full !== false) {
    const pct = Math.round((r.score / r.total) * 100);
    if (agg.fullBest === null || pct > agg.fullBest) agg.fullBest = pct;
    agg.fullDays.add(r.date.split('T')[0]);
  }
}

// 순수 함수: 단원 집계로 칭호 결정
function computeTier(agg: UnitAgg): UnitTier {
  if (!agg.hasAny) {
    return { ...TIERS.beginner, level: 'beginner', mastered: false, hint: '문제를 풀면 도전자!' };
  }
  const fb = agg.fullBest;
  if (fb !== null && fb >= 90 && agg.fullDays.size >= 2) {
    return { ...TIERS.master, level: 'master', mastered: true };
  }
  if (fb !== null && fb >= 80) {
    const hint = fb < 90
      ? `전부 풀기 최고 ${fb}% → 90% 이상이면 마스터 한 걸음!`
      : '다른 날 전부 풀기 한 번 더 90%면 마스터!';
    return { ...TIERS.skilled, level: 'skilled', mastered: false, hint };
  }
  const hint = fb === null
    ? '전부 풀기에 도전해 숙련자가 되어 보세요!'
    : `전부 풀기 최고 ${fb}% → 80% 이상이면 숙련자!`;
  return { ...TIERS.challenger, level: 'challenger', mastered: false, hint };
}

// 순수 함수: 결과 배열에서 단원 칭호 계산 (결과화면 승급 판정 등 재사용)
export function tierFromResults(results: QuizAttempt[], unitCode: string): UnitTier {
  const agg = emptyAgg();
  for (const r of results) {
    if (r.unitCode === unitCode) accumulate(agg, r);
  }
  return computeTier(agg);
}

export function getUnitTier(unitCode: string): UnitTier {
  return tierFromResults(getQuizResults(), unitCode);
}

// 전체 결과를 단 한 번 순회해 단원별 칭호 맵을 만든다 (반복 getUnitTier 호출 회피)
export function getUnitTierMap(): Record<string, UnitTier> {
  const acc: Record<string, UnitAgg> = {};
  for (const r of getQuizResults()) {
    let d = acc[r.unitCode];
    if (!d) { d = emptyAgg(); acc[r.unitCode] = d; }
    accumulate(d, r);
  }
  const map: Record<string, UnitTier> = {};
  for (const [code, d] of Object.entries(acc)) {
    map[code] = computeTier(d);
  }
  return map;
}

// 한 번이라도 맞힌 서로 다른 문항 id 집합 (정복도 계산용)
export function getCorrectQuestionIds(results: QuizAttempt[] = getQuizResults()): Set<string> {
  const set = new Set<string>();
  for (const r of results) {
    for (const a of r.answers) {
      if (a.correct) set.add(a.questionId);
    }
  }
  return set;
}

// 정복도 60% 이상 도전자 = '전부 풀기'로 승급시킬 전환 후보
export const CONVERT_COVERAGE = 0.6;

export function isConversionCandidate(unitCode: string, questionIds: string[]): boolean {
  if (questionIds.length === 0) return false;
  if (getUnitTier(unitCode).level !== 'challenger') return false;
  const correct = getCorrectQuestionIds();
  const covered = questionIds.filter(id => correct.has(id)).length;
  return covered / questionIds.length >= CONVERT_COVERAGE;
}

export function getUnitMastery(unitCode: string): { mastered: boolean; hint?: string } {
  const tier = getUnitTier(unitCode);
  return { mastered: tier.mastered, hint: tier.hint };
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

const EXAM_START = '2026-06-15';
const EXAM_DATE = '2026-06-26';

export function getExamCalendar(): { date: string; active: boolean; isToday: boolean; isExam: boolean; isPast: boolean }[] {
  const dates = new Set(getActivityDates());
  const today = getToday();
  const calendar: { date: string; active: boolean; isToday: boolean; isExam: boolean; isPast: boolean }[] = [];
  let current = EXAM_START;
  while (current <= EXAM_DATE) {
    calendar.push({
      date: current,
      active: dates.has(current),
      isToday: current === today,
      isExam: current === EXAM_DATE,
      isPast: current < today,
    });
    current = dateOffset(current, 1);
  }
  return calendar;
}

export function getDday(): number {
  const today = getToday();
  if (today >= EXAM_DATE) return 0;
  let count = 0;
  let current = today;
  while (current < EXAM_DATE) {
    count++;
    current = dateOffset(current, 1);
  }
  return count;
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

// ── 인출 연습(study) 완료 기록 ──

const STUDY_COMPLETION_KEY = 'grammar_study_completion';

interface StudyCompletionData {
  dates: string[];
  lastCompleted: string;
}

export function saveStudyCompletion(unitCode: string): void {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(STUDY_COMPLETION_KEY);
  const all: Record<string, StudyCompletionData> = raw ? JSON.parse(raw) : {};
  const today = getToday();
  const entry = all[unitCode] || { dates: [], lastCompleted: '' };
  if (!entry.dates.includes(today)) {
    entry.dates.push(today);
  }
  entry.lastCompleted = today;
  all[unitCode] = entry;
  localStorage.setItem(STUDY_COMPLETION_KEY, JSON.stringify(all));
  recordActivity();
  triggerSync();
}

export function getStudyCompletion(unitCode: string): { completed: boolean; count: number; lastDate: string | null } {
  if (typeof window === 'undefined') return { completed: false, count: 0, lastDate: null };
  const raw = localStorage.getItem(STUDY_COMPLETION_KEY);
  if (!raw) return { completed: false, count: 0, lastDate: null };
  const all: Record<string, StudyCompletionData> = JSON.parse(raw);
  const entry = all[unitCode];
  if (!entry) return { completed: false, count: 0, lastDate: null };
  return { completed: true, count: entry.dates.length, lastDate: entry.lastCompleted };
}

import { StudentProfile, QuizAttempt, AnswerRecord } from './types';

const PROFILE_KEY = 'grammar_student_profile';
const RESULTS_KEY = 'grammar_quiz_results';
const LAST_RESULT_KEY = 'grammar_last_result';
const RESOLVED_KEY = 'grammar_resolved_questions';

export type WrongAnswerRecord = AnswerRecord & { unitCode: string; date: string };

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

  // 새로 틀린 문제는 오답 노트의 '해결' 상태를 취소 (다시 노트에 표시됨)
  const newWrong = result.answers.filter(a => !a.correct).map(a => a.questionId);
  if (newWrong.length > 0) {
    const resolved = getResolvedQuestionIds();
    const remaining = resolved.filter(id => !newWrong.includes(id));
    if (remaining.length !== resolved.length) {
      localStorage.setItem(RESOLVED_KEY, JSON.stringify(remaining));
    }
  }
}

export function getLastQuizResult(): QuizAttempt | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(LAST_RESULT_KEY);
  return data ? JSON.parse(data) : null;
}

export function getBestScore(unitCode: string): number | null {
  // 중간 종료(completed === false) 기록은 최고 점수 집계에서 제외
  const results = getQuizResults().filter(
    r => r.unitCode === unitCode && r.completed !== false
  );
  if (results.length === 0) return null;
  return Math.max(...results.map(r => Math.round((r.score / r.total) * 100)));
}

export function getUnitAttemptCount(unitCode: string): number {
  return getQuizResults().filter(r => r.unitCode === unitCode).length;
}

// ── 오답 노트 '해결' 처리 (복습 퀴즈에서 맞히면 노트에서 사라짐) ──

export function getResolvedQuestionIds(): string[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(RESOLVED_KEY);
  return data ? JSON.parse(data) : [];
}

export function markQuestionResolved(questionId: string) {
  const ids = getResolvedQuestionIds();
  if (!ids.includes(questionId)) {
    ids.push(questionId);
    localStorage.setItem(RESOLVED_KEY, JSON.stringify(ids));
  }
}

export function unmarkQuestionResolved(questionId: string) {
  const ids = getResolvedQuestionIds();
  const remaining = ids.filter(id => id !== questionId);
  if (remaining.length !== ids.length) {
    localStorage.setItem(RESOLVED_KEY, JSON.stringify(remaining));
  }
}

export function getAllWrongAnswers(): WrongAnswerRecord[] {
  const results = getQuizResults();
  const resolved = new Set(getResolvedQuestionIds());
  const wrong: WrongAnswerRecord[] = [];
  for (const result of results) {
    for (const answer of result.answers) {
      if (!answer.correct && !resolved.has(answer.questionId)) {
        wrong.push({ ...answer, unitCode: result.unitCode, date: result.date });
      }
    }
  }
  return wrong;
}

// 같은 문제를 여러 번 틀린 경우 가장 최근 기록만 남김
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

export function clearAllHistory() {
  localStorage.removeItem(RESULTS_KEY);
  localStorage.removeItem(LAST_RESULT_KEY);
  localStorage.removeItem(RESOLVED_KEY);
  clearProfile();
}

export function getUnitProgress(): Record<string, { attempts: number; bestScore: number | null }> {
  const results = getQuizResults();
  const progress: Record<string, { attempts: number; bestScore: number | null }> = {};
  for (const result of results) {
    if (!progress[result.unitCode]) {
      progress[result.unitCode] = { attempts: 0, bestScore: null };
    }
    const entry = progress[result.unitCode];
    entry.attempts++;
    // 중간 종료(completed === false) 기록은 최고 점수 집계에서 제외
    if (result.completed !== false) {
      const pct = Math.round((result.score / result.total) * 100);
      if (entry.bestScore === null || pct > entry.bestScore) {
        entry.bestScore = pct;
      }
    }
  }
  return progress;
}

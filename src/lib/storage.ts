import { StudentProfile, QuizAttempt, AnswerRecord } from './types';

const PROFILE_KEY = 'grammar_student_profile';
const RESULTS_KEY = 'grammar_quiz_results';
const LAST_RESULT_KEY = 'grammar_last_result';

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
}

export function getLastQuizResult(): QuizAttempt | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(LAST_RESULT_KEY);
  return data ? JSON.parse(data) : null;
}

export function getBestScore(unitCode: string): number | null {
  const results = getQuizResults().filter(r => r.unitCode === unitCode);
  if (results.length === 0) return null;
  return Math.max(...results.map(r => Math.round((r.score / r.total) * 100)));
}

export function getUnitAttemptCount(unitCode: string): number {
  return getQuizResults().filter(r => r.unitCode === unitCode).length;
}

export function getAllWrongAnswers(): (AnswerRecord & { unitCode: string; date: string })[] {
  const results = getQuizResults();
  const wrong: (AnswerRecord & { unitCode: string; date: string })[] = [];
  for (const result of results) {
    for (const answer of result.answers) {
      if (!answer.correct) {
        wrong.push({ ...answer, unitCode: result.unitCode, date: result.date });
      }
    }
  }
  return wrong;
}

export function getUnitProgress(): Record<string, { attempts: number; bestScore: number | null }> {
  const results = getQuizResults();
  const progress: Record<string, { attempts: number; bestScore: number | null }> = {};
  for (const result of results) {
    const pct = Math.round((result.score / result.total) * 100);
    if (!progress[result.unitCode]) {
      progress[result.unitCode] = { attempts: 1, bestScore: pct };
    } else {
      progress[result.unitCode].attempts++;
      if (progress[result.unitCode].bestScore === null || pct > progress[result.unitCode].bestScore!) {
        progress[result.unitCode].bestScore = pct;
      }
    }
  }
  return progress;
}

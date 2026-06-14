import { Question } from '@/lib/types';

export function splitQuestions(questions: Question[], partIndex: number): Question[] {
  if (partIndex === 0) return questions.slice(0, 8);
  if (partIndex === 1) return questions.slice(8, 16);
  return questions.slice(16);
}

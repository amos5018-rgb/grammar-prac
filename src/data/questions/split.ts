import { Question } from '@/lib/types';

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function todaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function splitQuestions(questions: Question[], partIndex: number): Question[] {
  const shuffled = seededShuffle(questions, todaySeed());
  const groups: Question[][] = [[], [], []];
  for (let i = 0; i < shuffled.length; i++) {
    if (i < 8) groups[0].push(shuffled[i]);
    else if (i < 16) groups[1].push(shuffled[i]);
    else groups[2].push(shuffled[i]);
  }
  return groups[partIndex] ?? [];
}

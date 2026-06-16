import { Unit } from '@/lib/types';
import { allQuestions } from '@/data/questions';
import { splitQuestions } from './split';

export function getUnitQuestionIds(unit: Unit): string[] {
  if (unit.study) return [];
  if (unit.parentCode != null && unit.partIndex != null) {
    const parent = allQuestions.filter(q => q.unitCode === unit.parentCode);
    return splitQuestions(parent, unit.partIndex).map(q => q.id);
  }
  return allQuestions.filter(q => q.unitCode === unit.code).map(q => q.id);
}

import { Unit } from '@/lib/types';
import { allQuestions } from '@/data/questions';
import { splitQuestions } from './split';

// 단원의 문항 id 목록 (고난도 분할 파트는 부모를 동일 규칙으로 분할)
export function getUnitQuestionIds(unit: Unit): string[] {
  if (unit.study) return [];
  if (unit.parentCode != null && unit.partIndex != null) {
    const parent = allQuestions.filter(q => q.unitCode === unit.parentCode);
    return splitQuestions(parent, unit.partIndex).map(q => q.id);
  }
  return allQuestions.filter(q => q.unitCode === unit.code).map(q => q.id);
}

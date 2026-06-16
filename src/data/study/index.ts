import { StudyCard } from '@/lib/types';
import { phonemeChangeStudyCards } from './phoneme-change-study';
import { grammarElementsStudyCards } from './grammar-elements-study';

export const allStudyCards: Record<string, StudyCard[]> = {
  'phoneme-change-study': phonemeChangeStudyCards,
  'grammar-elements-study': grammarElementsStudyCards,
};

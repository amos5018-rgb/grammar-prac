// ============================================================
// 📦 문제 모음 (새 단원 문제 파일을 만들면 여기에 등록하세요)
// ============================================================
// 1) 위쪽에 import 한 줄 추가
// 2) 아래 allQuestions 배열에 ...변수명 추가
// ============================================================
import { Question } from '@/lib/types';
import { phonemeBasicsQuestions } from './phoneme-basics';
import { consonantSystemQuestions } from './consonant-system';
import { finalConsonantsQuestions } from './final-consonants';
import { morphemeBasicsQuestions } from './morpheme-basics';
import { phonemeChangeTypesQuestions } from './phoneme-change-types';
import { nasalLiquidQuestions } from './nasal-liquid';
import { palatalizationQuestions } from './palatalization';
import { tensificationAspirationQuestions } from './tensification-aspiration';
import { deletionAdditionQuestions } from './deletion-addition';
import { honorificsQuestions } from './honorifics';
import { timeExpressionQuestions } from './time-expression';
import { passiveQuotationQuestions } from './passive-quotation';
import { phonemeChangeReviewQuestions } from './phoneme-change-review';
import { grammarElementsReviewQuestions } from './grammar-elements-review';
import { advancedBasicsQuestions } from './advanced-basics';
import { advancedPhonemeChangeQuestions } from './advanced-phoneme-change';
import { advancedGrammarQuestions } from './advanced-grammar';

export const allQuestions: Question[] = [
  ...phonemeBasicsQuestions,
  ...consonantSystemQuestions,
  ...finalConsonantsQuestions,
  ...morphemeBasicsQuestions,
  ...phonemeChangeTypesQuestions,
  ...nasalLiquidQuestions,
  ...palatalizationQuestions,
  ...tensificationAspirationQuestions,
  ...deletionAdditionQuestions,
  ...honorificsQuestions,
  ...timeExpressionQuestions,
  ...passiveQuotationQuestions,
  ...phonemeChangeReviewQuestions,
  ...grammarElementsReviewQuestions,
  ...advancedBasicsQuestions,
  ...advancedPhonemeChangeQuestions,
  ...advancedGrammarQuestions,
];

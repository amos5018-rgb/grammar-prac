// ============================================================
// 📝 [음운 변동의 개념과 유형] 문제 (학습지: 우리말 소리의 변화 1차시)
// ============================================================
// 문제 작성 형식은 phoneme-basics.ts 상단 안내 참고
// ============================================================
import { Question } from '@/lib/types';

export const phonemeChangeTypesQuestions: Question[] = [
  {
    id: 'PC001', unitCode: 'phoneme-change-types', type: '객관식', difficulty: '하',
    passage: '',
    question: '한 음운이 일정한 환경에서 다른 음운으로 바뀌어 소리 나는 현상을 무엇이라고 하는가?',
    choices: ['음운 변동', '음운의 환경', '형태소 분석', '연음'],
    answer: '1',
    explanation: "음운 변동이란 한 음운이 일정한 환경에서 다른 음운으로 바뀌어 소리 나는 현상입니다. (예: 윷만[윤만])",
  },
  {
    id: 'PC002', unitCode: 'phoneme-change-types', type: '객관식', difficulty: '하',
    passage: '',
    question: '서로 다른 두 음운이 합쳐져 제3의 음운으로 바뀌는 음운 변동 유형은? (A + B → C)',
    choices: ['교체', '축약', '탈락', '첨가'],
    answer: '2',
    explanation: '축약은 두 음운이 합쳐져 새로운 한 개의 음운으로 바뀌는 유형입니다. (예: 놓고[노코] — ㅎ+ㄱ→ㅋ)',
  },
  {
    id: 'PC003', unitCode: 'phoneme-change-types', type: '단답형', difficulty: '하',
    passage: '',
    question: '두 음운 중 하나의 음운이 발음되지 않는 음운 변동 유형은? (A, B → A)',
    choices: [],
    answer: '탈락',
    explanation: '탈락은 두 음운 중 하나의 음운이 발음되지 않는 유형입니다. (예: 낳은[나은] — ㅎ이 발음되지 않음)',
  },
  {
    id: 'PC004', unitCode: 'phoneme-change-types', type: '객관식', difficulty: '중',
    passage: '',
    question: "'물난리[물랄리]'에서 일어난 음운 변동의 유형은?",
    choices: ['교체', '축약', '탈락', '첨가'],
    answer: '1',
    explanation: "'ㄴ'이 'ㄹ'로 바뀌어 소리 나므로(A → B) 교체입니다.",
  },
  {
    id: 'PC005', unitCode: 'phoneme-change-types', type: '객관식', difficulty: '중',
    passage: '',
    question: "'낳-+-은 → [나은]'에서 일어난 음운 변동의 유형은?",
    choices: ['교체', '축약', '탈락', '첨가'],
    answer: '3',
    explanation: "받침의 'ㅎ'이 발음되지 않으므로(A, B → A) 탈락입니다.",
  },
  {
    id: 'PC006', unitCode: 'phoneme-change-types', type: '객관식', difficulty: '중',
    passage: '',
    question: "'아니-+-오 → [아니요]'에서 일어난 음운 변동의 유형은?",
    choices: ['교체', '축약', '탈락', '첨가'],
    answer: '4',
    explanation: "반모음 'ㅣ'가 새로 생겨나 소리 나므로(A, B → A, C, B) 첨가입니다.",
  },
  {
    id: 'PC007', unitCode: 'phoneme-change-types', type: '객관식', difficulty: '중',
    passage: '',
    question: "'놓-+-고 → [노코]'에서 일어난 음운 변동의 유형은?",
    choices: ['교체', '축약', '탈락', '첨가'],
    answer: '2',
    explanation: "'ㅎ'과 'ㄱ'이 만나 'ㅋ'으로 소리 나므로(A + B → C) 축약입니다.",
  },
  {
    id: 'PC008', unitCode: 'phoneme-change-types', type: '객관식', difficulty: '상',
    passage: '',
    question: "'축하[추카]'에서 일어난 음운 변동의 유형은?",
    choices: ['교체', '축약', '탈락', '첨가'],
    answer: '2',
    explanation: "'ㄱ'과 'ㅎ'이 만나 'ㅋ'이라는 제3의 음운으로 합쳐졌으므로 축약입니다.",
  },
  {
    id: 'PC009', unitCode: 'phoneme-change-types', type: '객관식', difficulty: '상',
    passage: '',
    question: "'좋은[조은]'에서 일어난 음운 변동의 유형은?",
    choices: ['교체', '축약', '탈락', '첨가'],
    answer: '3',
    explanation: "어간 말음 'ㅎ' 뒤에 모음으로 시작하는 형식 형태소가 와서 'ㅎ'이 발음되지 않으므로 탈락입니다.",
  },
  {
    id: 'PC010', unitCode: 'phoneme-change-types', type: '객관식', difficulty: '상',
    passage: '',
    question: "'칼날[칼랄]'에서 일어난 음운 변동의 유형은?",
    choices: ['첨가', '축약', '탈락', '교체'],
    answer: '4',
    explanation: "'ㄴ'이 'ㄹ'의 뒤에서 'ㄹ'로 바뀌어 소리 나므로(유음화) 교체입니다.",
  },
  {
    id: 'PC011', unitCode: 'phoneme-change-types', type: 'ox', difficulty: '중',
    passage: '',
    question: '음운의 변동은 표준어의 발음에서 모두 허용되며, 이를 정리한 것이 표준 발음법이다.',
    choices: [],
    answer: 'X',
    explanation: '음운의 변동이 표준어의 발음에서 모두 허용되는 것은 아닙니다. 그중 허용되는 것만을 규범화한 것이 표준 발음법입니다.',
  },
  {
    id: 'PC012', unitCode: 'phoneme-change-types', type: '객관식', difficulty: '중',
    passage: '',
    question: '교체에 해당하는 음운 변동끼리 바르게 묶인 것은?',
    choices: [
      '모음 탈락, 비음화',
      '거센소리되기, 반모음 첨가',
      '비음화, 유음화, 구개음화, 된소리되기',
      '반모음 첨가, 된소리되기',
    ],
    answer: '3',
    explanation: '교체: 비음화, 유음화, 구개음화, 된소리되기 / 축약: 거센소리되기 / 탈락: 모음 탈락 / 첨가: 반모음 첨가',
  },
];

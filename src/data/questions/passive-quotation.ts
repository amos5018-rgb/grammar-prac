// ============================================================
// 📝 [피동 표현과 인용 표현] 문제 (학습지: 우리말의 문법 요소와 어휘 표현)
// ============================================================
// 문제 작성 형식은 phoneme-basics.ts 상단 안내 참고
// ============================================================
import { Question } from '@/lib/types';

export const passiveQuotationQuestions: Question[] = [
  {
    id: 'PQ001', unitCode: 'passive-quotation', type: '객관식', difficulty: '하',
    passage: '',
    question: '피동 표현에 대한 설명으로 알맞은 것은?',
    choices: [
      '주어가 다른 주체에 의해서 동작을 당하는 것을 나타냄',
      '주어가 동작을 제힘으로 하는 것을 나타냄',
      '청자를 높이는 것을 나타냄',
      '다른 사람의 말을 끌어다 쓰는 것을 나타냄',
    ],
    answer: '1',
    explanation: '피동 표현은 주어가 다른 주체에 의해 동작을 당하는 것을 나타냅니다. 주어가 제힘으로 하는 것은 능동 표현입니다.',
  },
  {
    id: 'PQ002', unitCode: 'passive-quotation', type: '객관식', difficulty: '하',
    passage: '',
    question: '파생적 피동문을 만드는 피동 접미사끼리 바르게 묶인 것은?',
    choices: [
      '-이-, -히-, -리-, -기-',
      '-시-, -었-, -겠-',
      '-는-, -ㄴ-, -던',
      '-라고, -고',
    ],
    answer: '1',
    explanation: "피동사는 능동사의 어근에 피동 접미사 '-이-, -히-, -리-, -기-' 또는 '-되다'가 붙어 만들어집니다.",
  },
  {
    id: 'PQ003', unitCode: 'passive-quotation', type: '객관식', difficulty: '중',
    passage: '경찰이 도둑을 붙잡았다. → 도둑이 경찰에게 붙잡혔다.',
    question: '능동문이 피동문으로 바뀔 때의 변화로 알맞은 것은?',
    choices: [
      '능동문의 목적어가 피동문의 주어가 된다',
      '능동문의 주어가 피동문의 목적어가 된다',
      '능동문의 목적어가 피동문의 부사어가 된다',
      '능동문의 서술어가 그대로 유지된다',
    ],
    answer: '1',
    explanation: "능동문의 목적어(도둑을)는 피동문의 주어(도둑이)가 되고, 능동문의 주어(경찰이)는 피동문의 부사어(경찰에게)가 됩니다.",
  },
  {
    id: 'PQ004', unitCode: 'passive-quotation', type: '객관식', difficulty: '상',
    passage: '사냥꾼이 토끼를 잡았다.',
    question: '위 능동문을 피동문으로 바르게 바꾼 것은?',
    choices: [
      '토끼가 사냥꾼에게 잡혔다.',
      '사냥꾼이 토끼에게 잡혔다.',
      '토끼를 사냥꾼이 잡았다.',
      '토끼가 사냥꾼을 잡았다.',
    ],
    answer: '1',
    explanation: "목적어 '토끼를'이 주어 '토끼가'로, 주어 '사냥꾼이'가 부사어 '사냥꾼에게'로 바뀌고, 능동사 '잡다'가 피동사 '잡히다'로 바뀝니다.",
  },
  {
    id: 'PQ005', unitCode: 'passive-quotation', type: '단답형', difficulty: '상',
    passage: '',
    question: "'쫓다'에 피동 접미사를 붙여 만든 피동사는?",
    choices: [],
    answer: '쫓기다',
    explanation: "'쫓다'의 어근에 피동 접미사 '-기-'가 붙어 '쫓기다'가 됩니다. (예: 사슴이 호랑이에게 쫓긴다.)",
  },
  {
    id: 'PQ006', unitCode: 'passive-quotation', type: '객관식', difficulty: '중',
    passage: '',
    question: '통사적 피동문을 만드는 표현끼리 바르게 묶인 것은?',
    choices: [
      "'-어/아지다', '-게 되다'",
      "'-이-', '-히-'",
      "'-시-', '께서'",
      "'라고', '고'",
    ],
    answer: '1',
    explanation: "통사적 피동문은 '-어/아지다', '-게 되다'를 활용합니다. (예: 이 펜은 글씨가 잘 써진다. / 곧 사실이 드러나게 된다.)",
  },
  {
    id: 'PQ007', unitCode: 'passive-quotation', type: '객관식', difficulty: '상',
    passage: '',
    question: '다음 중 이중 피동이 쓰인 문장은?',
    choices: [
      '바람에 문이 닫혔다.',
      '아기가 엄마 품에 안겼다.',
      '그 노래는 사람들에게 자주 불려졌다.',
      '멀리서 종소리가 들렸다.',
    ],
    answer: '3',
    explanation: "'불려졌다'는 피동 접미사 '-리-'와 '-어지다'를 겹쳐 쓴 이중 피동으로, 문법에 어긋난 표현입니다. '불렸다'가 올바른 표현입니다.",
  },
  {
    id: 'PQ008', unitCode: 'passive-quotation', type: 'ox', difficulty: '상',
    passage: '그 사건은 사람들에게서 점차 잊혀졌다.',
    question: '위 문장의 피동 표현은 문법에 맞는 표현이다.',
    choices: [],
    answer: 'X',
    explanation: "'잊혀졌다'는 피동 접미사 '-히-'와 '-어지다'를 겹쳐 쓴 이중 피동입니다. '잊혔다'가 올바른 표현입니다.",
  },
  {
    id: 'PQ009', unitCode: 'passive-quotation', type: '빈칸', difficulty: '하',
    passage: '',
    question: '직접 인용절 다음에는 조사 [___]를 쓰고, 간접 인용절 다음에는 조사 [___]를 쓴다.',
    choices: [],
    answer: '라고/고',
    explanation: "직접 인용은 큰따옴표와 함께 조사 '라고'를, 간접 인용은 조사 '고'를 씁니다.",
  },
  {
    id: 'PQ010', unitCode: 'passive-quotation', type: 'ox', difficulty: '중',
    passage: '',
    question: '간접 인용 표현에서는 인용절에 큰따옴표를 사용한다.',
    choices: [],
    answer: 'X',
    explanation: '큰따옴표는 직접 인용에서 사용합니다. 간접 인용은 따옴표 없이 자신의 관점에 따라 표현을 바꾸어 인용합니다.',
  },
  {
    id: 'PQ011', unitCode: 'passive-quotation', type: '객관식', difficulty: '상',
    passage: '동생이 "나는 지금 배가 고파."라고 말했다.',
    question: '위 문장을 간접 인용 표현으로 바르게 바꾼 것은?',
    choices: [
      '동생이 자기는 그때 배가 고프다고 말했다.',
      '동생이 나는 지금 배가 고파라고 말했다.',
      '동생이 자기는 배가 고프다라고 말했다.',
      '동생이 배가 고프냐고 말했다.',
    ],
    answer: '1',
    explanation: "간접 인용에서는 조사 '고'를 쓰고, 인칭('나'→'자기')과 시간 표현('지금'→'그때'), 종결 표현을 상황에 맞게 바꿉니다.",
  },
  {
    id: 'PQ012', unitCode: 'passive-quotation', type: '객관식', difficulty: '상',
    passage: '',
    question: '다음 중 통사적 피동문은?',
    choices: [
      '쥐가 고양이에게 잡혔다.',
      '오랜 연구 끝에 사실이 밝혀지게 되었다.',
      '아이가 어머니 품에 안겼다.',
      '안건이 만장일치로 가결되었다.',
    ],
    answer: '2',
    explanation: "'-게 되다'를 활용한 통사적 피동문입니다. ①, ③은 피동 접미사를 활용한 파생적 피동문, ④는 '-되다'에 의한 파생적 피동문입니다.",
  },
];

// ============================================================
// 📝 [시간 표현] 문제 (학습지: 우리말의 문법 요소와 어휘 표현)
// ============================================================
// 문제 작성 형식은 phoneme-basics.ts 상단 안내 참고
// ============================================================
import { Question } from '@/lib/types';

export const timeExpressionQuestions: Question[] = [
  {
    id: 'TE001', unitCode: 'time-expression', type: '빈칸', difficulty: '하',
    passage: '',
    question: '동작이나 상태에 해당하는 사건이 일어난 시점을 [___], 화자가 어떤 상황에 대해 말을 하는 시점을 [___]라고 한다.',
    choices: [],
    answer: '사건시/발화시',
    explanation: '사건시는 사건이 일어난 때, 발화시는 화자가 말하는 때입니다. 두 시점의 관계에 따라 과거·현재·미래 시제가 구분됩니다.',
  },
  {
    id: 'TE002', unitCode: 'time-expression', type: '객관식', difficulty: '하',
    passage: '',
    question: '과거 시제에 대한 설명으로 알맞은 것은?',
    choices: [
      '사건시가 발화시보다 앞서 있는 시제',
      '발화시와 사건시가 일치하는 시제',
      '사건시가 발화시보다 나중인 시제',
      '사건시와 발화시가 없는 시제',
    ],
    answer: '1',
    explanation: "과거 시제는 사건시가 발화시보다 앞서 있는 시제로, 선어말 어미 '-았-/-었-', '-더-' 등으로 실현됩니다.",
  },
  {
    id: 'TE003', unitCode: 'time-expression', type: '객관식', difficulty: '중',
    passage: '그 집 초밥이 맛있더라.',
    question: "위 문장의 '-더-'가 나타내는 의미는?",
    choices: [
      '과거 어느 때의 일이나 경험을 돌이켜 회상함',
      '미래의 일을 추측함',
      '현재 진행 중인 동작을 나타냄',
      '주체의 의지를 나타냄',
    ],
    answer: '1',
    explanation: "선어말 어미 '-더-'는 과거 어느 때의 일이나 경험을 돌이켜 회상하는 의미를 나타냅니다.",
  },
  {
    id: 'TE004', unitCode: 'time-expression', type: 'ox', difficulty: '중',
    passage: '정원의 꽃이 참 예쁘다.',
    question: '위 문장에서 형용사는 선어말 어미 없이 현재 시제를 표현하고 있다.',
    choices: [],
    answer: 'O',
    explanation: "동사는 '-는-/-ㄴ-'으로 현재를 표현하지만, 형용사와 서술격 조사는 선어말 어미 없이 현재 시제를 표현합니다.",
  },
  {
    id: 'TE005', unitCode: 'time-expression', type: '객관식', difficulty: '상',
    passage: '지금쯤 제주도에는 비가 내리겠다.',
    question: "위 문장에서 '-겠-'이 나타내는 의미는?",
    choices: ['추측', '주체의 의지', '가능성(능력)', '과거 회상'],
    answer: '1',
    explanation: "직접 보지 않은 제주도의 상황을 헤아려 말하고 있으므로 추측입니다. 학습지의 '철수는 이미 숙제를 끝냈겠다'와 같은 용법입니다.",
  },
  {
    id: 'TE006', unitCode: 'time-expression', type: '객관식', difficulty: '상',
    passage: '이번 대회에서는 제가 꼭 우승하겠습니다.',
    question: "위 문장에서 '-겠-'이 나타내는 의미는?",
    choices: ['추측', '주체의 의지', '가능성(능력)', '완료'],
    answer: '2',
    explanation: "화자 자신이 우승하려는 마음을 드러내므로 주체의 의지입니다. 학습지의 '나는 이번 국어시험에서 100점을 맞겠다'와 같은 용법입니다.",
  },
  {
    id: 'TE007', unitCode: 'time-expression', type: '객관식', difficulty: '상',
    passage: '그 정도 문제는 초등학생도 풀겠다.',
    question: "위 문장에서 '-겠-'이 나타내는 의미는?",
    choices: ['추측', '주체의 의지', '가능성(능력)', '과거 회상'],
    answer: '3',
    explanation: "초등학생도 풀 수 있다는 가능성(능력)을 나타냅니다. 학습지의 '이 일을 어떻게 혼자 다 하겠니?'와 같은 용법입니다.",
  },
  {
    id: 'TE008', unitCode: 'time-expression', type: '객관식', difficulty: '중',
    passage: '',
    question: '진행상을 나타내는 표현이 아닌 것은?',
    choices: ["'-고 있다'", "'-아/-어 가다'", "'-(으)면서'", "'-아/-어 버리다'"],
    answer: '4',
    explanation: "'-아/-어 버리다'는 동작이 이미 완료되었음을 나타내는 완료상 표현입니다. 나머지는 진행상 표현입니다.",
  },
  {
    id: 'TE009', unitCode: 'time-expression', type: '객관식', difficulty: '상',
    passage: '고양이가 소파 위에 누워 있다.',
    question: '위 문장의 동작상은?',
    choices: ['진행상', '완료상', '미래 시제', '과거 회상'],
    answer: '2',
    explanation: "'-아/-어 있다'는 동작이 완료된 상태가 지속됨을 나타내는 완료상입니다. 학습지의 '지현이는 의자에 앉아 있다'와 같은 표현입니다.",
  },
  {
    id: 'TE010', unitCode: 'time-expression', type: '객관식', difficulty: '상',
    passage: '누나가 노래를 부르면서 설거지를 한다.',
    question: '위 문장의 동작상은?',
    choices: ['진행상', '완료상', '과거 시제', '회상'],
    answer: '1',
    explanation: "연결 어미 '-(으)면서'는 두 동작이 동시에 진행되고 있음을 나타내는 진행상 표현입니다.",
  },
  {
    id: 'TE011', unitCode: 'time-expression', type: '객관식', difficulty: '상',
    passage: '이것은 내가 방학 동안 읽을 책이다.',
    question: "위 문장에서 '읽을'에 쓰인 관형사형 어미가 나타내는 시제는?",
    choices: ['과거', '현재', '미래', '시제 없음'],
    answer: '3',
    explanation: "관형사형 어미 '-(으)ㄹ'은 미래 시제를 나타냅니다. '읽은'(과거), '읽는'(현재), '읽을'(미래)로 구분됩니다.",
  },
];

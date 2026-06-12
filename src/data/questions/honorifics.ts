// ============================================================
// 📝 [높임 표현] 문제 (학습지: 우리말의 문법 요소와 어휘 표현)
// ============================================================
// 문제 작성 형식은 phoneme-basics.ts 상단 안내 참고
// ============================================================
import { Question } from '@/lib/types';

export const honorificsQuestions: Question[] = [
  {
    id: 'HN001', unitCode: 'honorifics', type: '객관식', difficulty: '하',
    passage: '',
    question: '화자가 청자를 높이거나 낮추어 말하는 높임법은?',
    choices: ['상대 높임', '주체 높임', '객체 높임', '간접 높임'],
    answer: '1',
    explanation: '상대 높임은 화자가 청자를 높이거나 낮추어 말하는 방법으로, 주로 종결 어미를 통해 실현됩니다.',
  },
  {
    id: 'HN002', unitCode: 'honorifics', type: '객관식', difficulty: '하',
    passage: '',
    question: '주체 높임을 실현하는 방법이 아닌 것은?',
    choices: [
      "선어말 어미 '-(으)시-'",
      "주격 조사 '께서'",
      "특수 어휘 '주무시다, 계시다'",
      "조사 '을/를'",
    ],
    answer: '4',
    explanation: "주체 높임은 '-(으)시-', '께서', 특수 어휘(주무시다, 계시다), 접미사 '-님' 등으로 실현됩니다. '을/를'은 목적격 조사일 뿐 높임과 무관합니다.",
  },
  {
    id: 'HN003', unitCode: 'honorifics', type: '객관식', difficulty: '중',
    passage: '',
    question: '객체 높임에 쓰이는 특수 어휘가 아닌 것은?',
    choices: ['뵙다', '드리다', '주무시다', '모시다'],
    answer: '3',
    explanation: "객체 높임의 특수 어휘는 '뵙다(뵈다), 드리다, 모시다, 여쭙다(여쭈다)'입니다. '주무시다'는 주체를 높이는 특수 어휘입니다.",
  },
  {
    id: 'HN004', unitCode: 'honorifics', type: '객관식', difficulty: '중',
    passage: '선생님 말씀이 타당하십니다.',
    question: '위 문장에 나타난 높임의 방식은?',
    choices: [
      '주체를 직접 높임',
      '주체와 관련된 대상을 높여 주체를 간접적으로 높임',
      '객체를 높임',
      '청자를 낮춤',
    ],
    answer: '2',
    explanation: "주체(선생님)와 밀접하게 관련된 대상(말씀)을 높임으로써 주체를 간접적으로 높이는 '간접 높임'입니다.",
  },
  {
    id: 'HN005', unitCode: 'honorifics', type: '객관식', difficulty: '중',
    passage: '',
    question: "객체 높임에서 조사 '에게' 대신 사용하는 조사는?",
    choices: ['께서', '한테', '께', '보고'],
    answer: '3',
    explanation: "객체 높임에서 부사어를 높일 때 '에게' 대신 '께'를 사용합니다. (예: 나는 선생님께 과일을 드렸다.) '께서'는 주체 높임의 주격 조사입니다.",
  },
  {
    id: 'HN006', unitCode: 'honorifics', type: '객관식', difficulty: '상',
    passage: '어머니께서 할머니를 모시고 병원에 가셨다.',
    question: '위 문장에 나타난 높임 표현을 바르게 분석한 것은?',
    choices: [
      '주체 높임만 실현됨',
      '객체 높임만 실현됨',
      '주체 높임과 객체 높임이 모두 실현됨',
      '높임 표현이 없음',
    ],
    answer: '3',
    explanation: "'께서'와 '-시-'(가셨다)로 주체(어머니)를 높이고, 특수 어휘 '모시다'로 객체(할머니)를 높이고 있습니다.",
  },
  {
    id: 'HN007', unitCode: 'honorifics', type: 'ox', difficulty: '상',
    passage: '할머니께서는 아직 눈이 밝으시다.',
    question: '위 문장은 간접 높임이 실현된 문장이다.',
    choices: [],
    answer: 'O',
    explanation: "주체(할머니)와 밀접하게 관련된 신체 일부(눈)를 '-시-'로 높여 주체를 간접적으로 높였습니다. 학습지의 '할머니께서는 아직 귀가 밝으십니다'와 같은 방식입니다.",
  },
  {
    id: 'HN008', unitCode: 'honorifics', type: '객관식', difficulty: '상',
    passage: '',
    question: '객체 높임이 실현된 문장은?',
    choices: [
      '아버지께서 낮잠을 주무신다.',
      '동생이 선생님께 책을 갖다드렸다.',
      '어서 오십시오.',
      '동생이 학교에 간다.',
    ],
    answer: '2',
    explanation: "조사 '께'와 특수 어휘 '드리다'로 객체(선생님)를 높였습니다. ①은 주체 높임, ③은 상대 높임(하십시오체)입니다.",
  },
  {
    id: 'HN009', unitCode: 'honorifics', type: 'ox', difficulty: '상',
    passage: '손님, 주문하신 커피 나오셨습니다.',
    question: '위 문장은 올바른 높임 표현이다.',
    choices: [],
    answer: 'X',
    explanation: "'커피'는 높여야 할 주체(손님)와 밀접하게 관련된 대상이 아니므로 '-시-'를 붙이는 것은 잘못입니다. '주문하신 커피 나왔습니다'가 올바른 표현입니다.",
  },
  {
    id: 'HN010', unitCode: 'honorifics', type: '객관식', difficulty: '중',
    passage: '',
    question: '격식체 중 아주 높임에 해당하는 것은?',
    choices: ['해라체', '하게체', '하오체', '하십시오체'],
    answer: '4',
    explanation: '격식체는 하십시오체(아주 높임) - 하오체(예사 높임) - 하게체(예사 낮춤) - 해라체(아주 낮춤) 순입니다.',
  },
  {
    id: 'HN011', unitCode: 'honorifics', type: '객관식', difficulty: '상',
    passage: '내일 선생님께 모르는 문제를 여쭤보려고 해요.',
    question: '위 문장에서 객체 높임을 실현하는 요소끼리 묶인 것은?',
    choices: [
      "'께'와 '여쭤보다'",
      "'내일'과 '문제'",
      "'-려고'와 '해요'",
      "'모르는'과 '보려고'",
    ],
    answer: '1',
    explanation: "조사 '께'와 특수 어휘 '여쭙다(여쭤보다)'가 객체(선생님)를 높입니다. 종결의 '해요'는 청자를 높이는 상대 높임(해요체)입니다.",
  },
];

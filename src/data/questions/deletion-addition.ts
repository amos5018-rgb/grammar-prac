// ============================================================
// 📝 [음운의 탈락과 첨가] 문제 (학습지: 우리말 소리의 변화 5차시)
// ============================================================
// 문제 작성 형식은 phoneme-basics.ts 상단 안내 참고
// ============================================================
import { Question } from '@/lib/types';

export const deletionAdditionQuestions: Question[] = [
  {
    id: 'DA001', unitCode: 'deletion-addition', type: '객관식', difficulty: '하',
    passage: '',
    question: "'ㅡ' 탈락이 일어나는 환경으로 알맞은 것은?",
    choices: [
      "어간 말음 'ㅡ'가 'ㅏ/ㅓ'로 시작하는 어미 앞에 올 때",
      "어간 말음 'ㅡ'가 'ㅗ/ㅜ'로 시작하는 어미 앞에 올 때",
      "어간 말음 'ㅡ'가 자음으로 시작하는 어미 앞에 올 때",
      "모든 어미 앞에서",
    ],
    answer: '1',
    explanation: "어간 말음 'ㅡ'는 'ㅏ/ㅓ'로 시작하는 어미 앞에서 탈락합니다. (예: 크-+-어 → 커) '쓰고', '크니'처럼 자음 어미 앞에서는 탈락하지 않습니다.",
  },
  {
    id: 'DA002', unitCode: 'deletion-addition', type: '객관식', difficulty: '중',
    passage: '',
    question: "'크-+-었-+-다'의 올바른 활용형은?",
    choices: ['크었다', '컸다', '캤다', '크다'],
    answer: '2',
    explanation: "어간 말음 'ㅡ'가 'ㅓ' 앞에서 탈락하여 '컸다'가 됩니다. (ㅡ 탈락)",
  },
  {
    id: 'DA003', unitCode: 'deletion-addition', type: '단답형', difficulty: '상',
    passage: '',
    question: "'바쁘-+-아서'의 올바른 활용형은?",
    choices: [],
    answer: '바빠서',
    explanation: "어간 말음 'ㅡ'가 'ㅏ' 앞에서 탈락하여 '바빠서'가 됩니다. 학습지의 '담그-+-아 → 담가'와 같은 원리입니다.",
  },
  {
    id: 'DA004', unitCode: 'deletion-addition', type: '단답형', difficulty: '상',
    passage: '',
    question: "'잠그-+-아'의 올바른 활용형은?",
    choices: [],
    answer: '잠가',
    explanation: "어간 말음 'ㅡ'가 'ㅏ' 앞에서 탈락하여 '잠가'가 됩니다. '문을 잠궈'는 잘못된 표현이고 '문을 잠가'가 맞습니다.",
  },
  {
    id: 'DA005', unitCode: 'deletion-addition', type: '객관식', difficulty: '중',
    passage: '',
    question: "'가-+-았-+-다'가 '갔다'가 되는 음운 변동은?",
    choices: ['동일 모음 탈락', 'ㅡ 탈락', '반모음 첨가', '거센소리되기'],
    answer: '1',
    explanation: "어간 말음 'ㅏ'가 'ㅏ'로 시작하는 어미 앞에서 탈락하는 동일 모음 탈락입니다.",
  },
  {
    id: 'DA006', unitCode: 'deletion-addition', type: '단답형', difficulty: '상',
    passage: '',
    question: "'만나-+-아서'의 올바른 활용형은?",
    choices: [],
    answer: '만나서',
    explanation: "어간 말음 'ㅏ'가 'ㅏ'로 시작하는 어미 앞에서 탈락하여 '만나서'가 됩니다. (동일 모음 탈락) 학습지의 '건너-+-어 → 건너'와 같은 원리입니다.",
  },
  {
    id: 'DA007', unitCode: 'deletion-addition', type: '객관식', difficulty: '상',
    passage: '',
    question: "'솔+나무'가 '소나무'가 되는 음운 변동은?",
    choices: ['ㄹ 탈락', 'ㅎ 탈락', 'ㅡ 탈락', '비음화'],
    answer: '1',
    explanation: "합성어가 만들어질 때 'ㄴ' 앞에서 'ㄹ'이 탈락했습니다. 학습지의 '아들+님 → 아드님', '바늘+질 → 바느질'과 같은 원리입니다.",
  },
  {
    id: 'DA008', unitCode: 'deletion-addition', type: '단답형', difficulty: '상',
    passage: '',
    question: "'딸+님'이 결합하면 어떤 단어가 되는가? (ㄹ 탈락에 주의)",
    choices: [],
    answer: '따님',
    explanation: "'ㄴ' 앞에서 'ㄹ'이 탈락하여 '따님'이 됩니다. '아들+님 → 아드님'과 같은 원리입니다.",
  },
  {
    id: 'DA009', unitCode: 'deletion-addition', type: '단답형', difficulty: '중',
    passage: '',
    question: "'낳은'을 소리 나는 대로 쓰면? (대괄호 없이)",
    choices: [],
    answer: '나은',
    explanation: "용언 어간 말음 'ㅎ' 뒤에 모음으로 시작하는 형식 형태소가 와서 'ㅎ'이 탈락하여 [나은]으로 발음됩니다.",
  },
  {
    id: 'DA010', unitCode: 'deletion-addition', type: '단답형', difficulty: '상',
    passage: '',
    question: "'쌓아'를 소리 나는 대로 쓰면? (대괄호 없이)",
    choices: [],
    answer: '싸아',
    explanation: "어간 말음 'ㅎ'이 모음으로 시작하는 어미 앞에서 탈락하여 [싸아]로 발음됩니다. 학습지의 '낳은[나은]', '닳아[다라]'와 같은 원리입니다.",
  },
  {
    id: 'DA011', unitCode: 'deletion-addition', type: 'ox', difficulty: '중',
    passage: '',
    question: "'되어'는 [되여]로 발음하는 것도 표준 발음으로 허용된다.",
    choices: [],
    answer: 'O',
    explanation: "표준 발음법 제22항에 따라 '되어[되어/되여]', '피어[피어/피여]' 모두 허용됩니다. (반모음 첨가)",
  },
  {
    id: 'DA012', unitCode: 'deletion-addition', type: '객관식', difficulty: '상',
    passage: '',
    question: '다음 중 반모음 첨가가 일어날 수 있는 것은?',
    choices: ['먹어', '쉬어', '잡아', '높아'],
    answer: '2',
    explanation: "반모음 첨가는 어간 말음 'ㅣ, ㅚ, ㅟ'와 모음으로 시작하는 어미 사이에서 일어납니다. '쉬어'는 어간 말음이 'ㅟ'이므로 [쉬여]로 발음할 수 있습니다. 학습지의 '뛰어[뛰여]'와 같은 원리입니다.",
  },
  {
    id: 'DA013', unitCode: 'deletion-addition', type: '객관식', difficulty: '상',
    passage: '그는 시험에 붙어서 기뻐서 어쩔 줄 몰랐다.',
    question: "위 문장의 '기뻐서'에서 일어난 음운 변동은?",
    choices: ['ㅡ 탈락 (기쁘-+-어서)', '동일 모음 탈락', 'ㅎ 탈락', '반모음 첨가'],
    answer: '1',
    explanation: "'기쁘-'의 어간 말음 'ㅡ'가 'ㅓ'로 시작하는 어미 앞에서 탈락하여 '기뻐서'가 되었습니다.",
  },
];

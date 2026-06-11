// ============================================================
// 📝 [받침의 발음] 문제 (학습지: 우리말 소리의 변화 2)
// ============================================================
// 문제 작성 형식은 phoneme-basics.ts 상단 안내 참고
// ============================================================
import { Question } from '@/lib/types';

export const finalConsonantsQuestions: Question[] = [
  {
    id: 'FC001', unitCode: 'final-consonants', type: '객관식', difficulty: '하',
    passage: '',
    question: '한국어 음절의 종성(받침)에서 발음될 수 있는 일곱 개의 소리로 알맞은 것은?',
    choices: [
      'ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ',
      'ㄱ, ㄴ, ㄹ, ㅁ, ㅅ, ㅈ, ㅎ',
      'ㄲ, ㅋ, ㅆ, ㅈ, ㅊ, ㅌ, ㅍ',
      'ㄱ, ㄷ, ㅂ, ㅈ, ㅅ, ㅎ, ㅇ',
    ],
    answer: '1',
    explanation: '한국어 음절의 종성에는 ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ의 일곱 소리만 발음될 수 있습니다.',
  },
  {
    id: 'FC002', unitCode: 'final-consonants', type: '단답형', difficulty: '하',
    passage: '',
    question: "'빛, 빗, 빚'은 모두 같은 소리로 발음됩니다. 소리 나는 대로 쓰면? (대괄호 없이 한 글자로)",
    choices: [],
    answer: '빋',
    explanation: "받침 ㅊ, ㅅ, ㅈ은 모두 대표음 [ㄷ]으로 발음되므로 '빛, 빗, 빚'은 모두 [빋]으로 소리 납니다.",
  },
  {
    id: 'FC003', unitCode: 'final-consonants', type: '단답형', difficulty: '중',
    passage: '',
    question: "'키읔'을 소리 나는 대로 쓰면? (대괄호 없이)",
    choices: [],
    answer: '키윽',
    explanation: "받침 ㅋ은 [ㄱ]으로 발음되므로 '키읔'은 [키윽]으로 소리 납니다.",
  },
  {
    id: 'FC004', unitCode: 'final-consonants', type: '단답형', difficulty: '중',
    passage: '',
    question: "'히읗'을 소리 나는 대로 쓰면? (대괄호 없이)",
    choices: [],
    answer: '히읃',
    explanation: "받침 ㅎ은 [ㄷ]으로 발음되므로 '히읗'은 [히읃]으로 소리 납니다.",
  },
  {
    id: 'FC005', unitCode: 'final-consonants', type: '객관식', difficulty: '하',
    passage: '',
    question: "'안팎'의 받침 'ㄲ'은 어떤 소리로 발음되는가?",
    choices: ['[ㄱ]', '[ㄲ]', '[ㅋ]', '[ㅇ]'],
    answer: '1',
    explanation: '받침 ㄲ, ㅋ은 대표음 [ㄱ]으로 발음됩니다.',
  },
  {
    id: 'FC006', unitCode: 'final-consonants', type: '객관식', difficulty: '중',
    passage: '',
    question: "'낮안개'의 발음으로 알맞은 것은?",
    choices: ['[나잔개]', '[나단개]', '[낟안개]', '[나잔내]'],
    answer: '2',
    explanation: "'안개'는 실질적 의미의 말이므로, '낮'의 받침 ㅈ이 대표음 [ㄷ]으로 바뀐 뒤 연음되어 [나단개]로 발음됩니다.",
  },
  {
    id: 'FC007', unitCode: 'final-consonants', type: '단답형', difficulty: '중',
    passage: '',
    question: "'낮에'를 소리 나는 대로 쓰면? (대괄호 없이)",
    choices: [],
    answer: '나제',
    explanation: "'에'는 문법적 의미의 말(조사)이므로 받침 ㅈ이 그대로 연음되어 [나제]로 발음됩니다.",
  },
  {
    id: 'FC008', unitCode: 'final-consonants', type: '단답형', difficulty: '중',
    passage: '',
    question: "'옷이'를 소리 나는 대로 쓰면? (대괄호 없이)",
    choices: [],
    answer: '오시',
    explanation: "'이'는 문법적 의미의 말(조사)이므로 받침 ㅅ이 그대로 연음되어 [오시]로 발음됩니다.",
  },
  {
    id: 'FC009', unitCode: 'final-consonants', type: '객관식', difficulty: '상',
    passage: '',
    question: "'숲온도'의 발음으로 알맞은 것은?",
    choices: ['[수폰도]', '[숩폰도]', '[수본도]', '[숲온도]'],
    answer: '3',
    explanation: "'온도'는 실질적 의미의 말이므로, '숲'의 받침 ㅍ이 대표음 [ㅂ]으로 바뀐 뒤 연음되어 [수본도]로 발음됩니다.",
  },
  {
    id: 'FC010', unitCode: 'final-consonants', type: '객관식', difficulty: '상',
    passage: "낮안개[나단개] / 낮에[나제]\n옷아래[오다래] / 옷이[오시]",
    question: '받침 뒤에 모음으로 시작하는 말이 올 때, 받침의 발음이 대표음으로 바뀌어 나는 경우는?',
    choices: [
      '뒷말이 문법적 의미의 말일 때',
      '뒷말이 실질적 의미의 말일 때',
      '뒷말이 모음 ㅣ로 시작할 때',
      '받침이 ㅇ일 때',
    ],
    answer: '2',
    explanation: '뒷말이 실질적 의미의 말(안개, 아래 등)이면 받침이 대표음으로 바뀌어 나고, 문법적 의미의 말(조사, 어미 등)이면 받침이 그대로 연음됩니다.',
  },
  {
    id: 'FC011', unitCode: 'final-consonants', type: '단답형', difficulty: '상',
    passage: '',
    question: "'헛웃음'을 소리 나는 대로 쓰면? (대괄호 없이)",
    choices: [],
    answer: '허두슴',
    explanation: "'웃-'은 실질 형태소이므로 '헛'의 ㅅ이 [ㄷ]으로 바뀌어 연음되고('허두'), '-음'은 형식 형태소이므로 '웃'의 ㅅ이 그대로 연음되어('슴') [허두슴]으로 발음됩니다.",
  },
  {
    id: 'FC012', unitCode: 'final-consonants', type: '객관식', difficulty: '중',
    passage: '',
    question: "'갚아라'의 발음으로 알맞은 것은?",
    choices: ['[갑파라]', '[가바라]', '[가파라]', '[갚아라]'],
    answer: '3',
    explanation: "'-아라'는 문법적 의미의 말(어미)이므로 받침 ㅍ이 그대로 연음되어 [가파라]로 발음됩니다.",
  },
  {
    id: 'FC013', unitCode: 'final-consonants', type: 'ox', difficulty: '중',
    passage: '',
    question: "'뱉어'는 [배더]로 발음된다.",
    choices: [],
    answer: 'X',
    explanation: "'-어'는 문법적 의미의 말(어미)이므로 받침 ㅌ이 그대로 연음되어 [배터]로 발음됩니다.",
  },
];

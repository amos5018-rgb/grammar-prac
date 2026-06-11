// ============================================================
// 📝 [음운의 개념과 환경] 문제 (학습지: 우리말 소리의 변화 1)
// ============================================================
// 문제 작성 형식 안내
//
//   id:          문제 고유 번호 (다른 문제와 겹치면 안 됨)
//   unitCode:    단원 코드 (units.ts의 code와 같아야 함)
//   type:        '객관식' | 'ox' | '빈칸' | '단답형'
//   difficulty:  '상' | '중' | '하'
//   passage:     <보기> 지문 (없으면 '' 빈칸으로)
//   question:    문제 내용 (빈칸 유형은 [___] 로 빈칸 표시)
//   choices:     객관식 보기 4개 (객관식이 아니면 [] 빈 배열)
//   answer:      정답
//                - 객관식: 보기 번호 '1'~'4'
//                - ox: 'O' 또는 'X'
//                - 빈칸: 빈칸이 여러 개면 '/'로 구분 (예: '어간/어미')
//                - 단답형: 정답 텍스트, 복수 정답은 '|'로 구분 (예: '경음|된소리')
//   explanation: 해설 (오답 시 학생에게 보여짐)
// ============================================================
import { Question } from '@/lib/types';

export const phonemeBasicsQuestions: Question[] = [
  {
    id: 'PB001', unitCode: 'phoneme-basics', type: '객관식', difficulty: '하',
    passage: '',
    question: '말의 뜻을 구별해 주는 소리의 가장 작은 단위는?',
    choices: ['음절', '음운', '형태소', '단어'],
    answer: '2',
    explanation: "말의 뜻을 구별해 주는 소리의 가장 작은 단위를 '음운'이라고 합니다. (예: 물:불 → ㅁ과 ㅂ이 뜻을 구별)",
  },
  {
    id: 'PB002', unitCode: 'phoneme-basics', type: '객관식', difficulty: '하',
    passage: '',
    question: "'물 : 불'에서 두 단어의 뜻을 구별해 주는 음운의 짝은?",
    choices: ['ㅁ, ㅂ', 'ㅜ, ㅜ', 'ㄹ, ㄹ', 'ㅏ, ㅣ'],
    answer: '1',
    explanation: "'물'과 '불'은 첫소리 'ㅁ'과 'ㅂ'만 다르고 나머지는 같습니다. 이 둘이 뜻을 구별해 주는 음운입니다.",
  },
  {
    id: 'PB003', unitCode: 'phoneme-basics', type: '객관식', difficulty: '하',
    passage: '',
    question: "'남 : 님'에서 두 단어의 뜻을 구별해 주는 음운의 짝은?",
    choices: ['ㄴ, ㄴ', 'ㅏ, ㅣ', 'ㅁ, ㅁ', 'ㄴ, ㅁ'],
    answer: '2',
    explanation: "'남'과 '님'은 가운뎃소리(중성) 'ㅏ'와 'ㅣ'만 다릅니다. 모음도 뜻을 구별해 주는 음운입니다.",
  },
  {
    id: 'PB004', unitCode: 'phoneme-basics', type: '빈칸', difficulty: '하',
    passage: '',
    question: "'감'을 소리 나는 순서로 배열하면, 초성(첫소리)은 ㄱ, 중성(가운뎃소리)은 [___], 종성(끝소리)은 [___]이다.",
    choices: [],
    answer: 'ㅏ/ㅁ',
    explanation: "'감'은 ㄱ(초성) → ㅏ(중성) → ㅁ(종성)의 순서로 소리 납니다.",
  },
  {
    id: 'PB005', unitCode: 'phoneme-basics', type: '객관식', difficulty: '중',
    passage: '',
    question: "문법에서 '환경'이란 무엇을 뜻하는가?",
    choices: ['단어의 뜻', '어떤 소리가 놓인 위치', '발음 기관의 모양', '소리의 세기'],
    answer: '2',
    explanation: "문법에서 '환경'이란 어떤 소리가 놓인 위치를 뜻합니다. (예: '감'에서 'ㄱ'의 환경은 'ㅏ의 앞')",
  },
  {
    id: 'PB006', unitCode: 'phoneme-basics', type: '단답형', difficulty: '중',
    passage: '',
    question: "'국물'에서 'ㅁ' 앞에 놓인 음운은? (자음 하나로 답하세요)",
    choices: [],
    answer: 'ㄱ',
    explanation: "'국물'에서 'ㅁ'의 바로 앞에는 '국'의 받침 'ㄱ'이 놓여 있습니다.",
  },
  {
    id: 'PB007', unitCode: 'phoneme-basics', type: '단답형', difficulty: '중',
    passage: '',
    question: "'젊다'에서 'ㄹ' 뒤에 놓인 음운은? (자음 하나로 답하세요)",
    choices: [],
    answer: 'ㅁ',
    explanation: "'젊다'의 받침은 'ㄻ'(ㄹ+ㅁ)이므로, 'ㄹ' 뒤에는 'ㅁ'이 놓여 있습니다.",
  },
  {
    id: 'PB008', unitCode: 'phoneme-basics', type: '단답형', difficulty: '중',
    passage: '',
    question: "'있다'에서 'ㄷ' 앞에 놓인 음운은? (자음 하나로 답하세요)",
    choices: [],
    answer: 'ㅆ',
    explanation: "'있다'에서 'ㄷ'의 바로 앞에는 '있'의 받침 'ㅆ'이 놓여 있습니다.",
  },
  {
    id: 'PB009', unitCode: 'phoneme-basics', type: '객관식', difficulty: '중',
    passage: '',
    question: "'문장'에서 'ㅇ'(받침)의 환경은?",
    choices: ['ㅏ의 앞', 'ㅏ의 뒤', 'ㅈ의 앞', 'ㅁ의 뒤'],
    answer: '2',
    explanation: "'문장'에서 'ㅇ'은 '장'의 받침(종성)으로, 모음 'ㅏ'의 뒤에 놓여 있습니다.",
  },
  {
    id: 'PB010', unitCode: 'phoneme-basics', type: '객관식', difficulty: '중',
    passage: '',
    question: '자음의 정의로 알맞은 것은?',
    choices: [
      '공기가 발음 기관의 방해를 받지 않고 나는 소리',
      '공기가 발음 기관에 의해 방해를 받으며 나는 소리',
      '소리의 길이나 높이로 뜻을 구별하는 소리',
      '홀로 음절을 이루지 못하는 소리',
    ],
    answer: '2',
    explanation: '자음은 소리를 낼 때 공기가 발음 기관에 의해 방해를 받으며 나는 소리이고, 모음은 방해를 받지 않고 나는 소리입니다.',
  },
  {
    id: 'PB011', unitCode: 'phoneme-basics', type: 'ox', difficulty: '하',
    passage: '',
    question: '모음은 소리를 낼 때 공기가 발음 기관에 의해 방해를 받지 않고 나는 소리이다.',
    choices: [],
    answer: 'O',
    explanation: '맞습니다. 모음은 공기가 방해받지 않고 나는 소리, 자음은 방해를 받으며 나는 소리입니다.',
  },
  {
    id: 'PB012', unitCode: 'phoneme-basics', type: '객관식', difficulty: '중',
    passage: '',
    question: '다음 중 비분절 음운이 아닌 것은?',
    choices: ['소리의 길이', '소리의 높이', '억양', '자음'],
    answer: '4',
    explanation: '자음과 모음은 분절 음운입니다. 비분절 음운에는 소리의 길이, 높이, 세기, 억양이 있습니다.',
  },
  {
    id: 'PB013', unitCode: 'phoneme-basics', type: 'ox', difficulty: '중',
    passage: '',
    question: '반모음은 홀로 음절을 이룰 수 있다.',
    choices: [],
    answer: 'X',
    explanation: '반모음은 홀로 음절을 이루지 못하고, 다른 모음과 결합하여 이중 모음을 이루는 소리입니다. (반모음 ㅣ, 반모음 ㅗ/ㅜ)',
  },
];

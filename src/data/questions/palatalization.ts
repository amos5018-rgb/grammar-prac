// ============================================================
// 📝 [음운의 교체: 구개음화] 문제 (학습지: 우리말 소리의 변화 3차시)
// ============================================================
// 문제 작성 형식은 phoneme-basics.ts 상단 안내 참고
// ============================================================
import { Question } from '@/lib/types';

export const palatalizationQuestions: Question[] = [
  {
    id: 'PL001', unitCode: 'palatalization', type: '객관식', difficulty: '하',
    passage: '',
    question: '구개음화에 대한 설명으로 알맞은 것은?',
    choices: [
      'ㄷ, ㅌ이 ㅣ나 반모음 ㅣ로 시작하는 형식 형태소 앞에서 ㅈ, ㅊ으로 바뀐다',
      'ㄷ, ㅌ이 모든 모음 앞에서 ㅈ, ㅊ으로 바뀐다',
      'ㅈ, ㅊ이 ㄷ, ㅌ으로 바뀐다',
      'ㄴ이 ㄹ의 앞에서 ㄹ로 바뀐다',
    ],
    answer: '1',
    explanation: "구개음화: ㄷ, ㅌ → ㅈ, ㅊ(경구개음) / ㅣ나 반모음 ㅣ로 시작하는 '형식 형태소' 앞. 모든 ㅣ 앞에서 일어나는 것이 아니라는 점이 중요합니다.",
  },
  {
    id: 'PL002', unitCode: 'palatalization', type: '단답형', difficulty: '중',
    passage: '',
    question: "'굳이'를 소리 나는 대로 쓰면? (대괄호 없이)",
    choices: [],
    answer: '구지',
    explanation: "'ㄷ'이 ㅣ로 시작하는 형식 형태소 앞에서 'ㅈ'으로 바뀌어 [구지]로 발음됩니다. (구개음화)",
  },
  {
    id: 'PL003', unitCode: 'palatalization', type: '단답형', difficulty: '중',
    passage: '',
    question: "'끝이'를 소리 나는 대로 쓰면? (대괄호 없이)",
    choices: [],
    answer: '끄치',
    explanation: "'ㅌ'이 ㅣ로 시작하는 형식 형태소(조사 '이') 앞에서 'ㅊ'으로 바뀌어 [끄치]로 발음됩니다.",
  },
  {
    id: 'PL004', unitCode: 'palatalization', type: '객관식', difficulty: '중',
    passage: '',
    question: '다음 중 구개음화가 일어나지 않는 것은?',
    choices: ['해돋이', '쇠붙이', '굳이', '잔디'],
    answer: '4',
    explanation: "'잔디[잔디]'의 '디'는 하나의 형태소 안에 있는 것이므로 구개음화가 일어나지 않습니다. 구개음화는 형식 형태소가 결합할 때 일어납니다.",
  },
  {
    id: 'PL005', unitCode: 'palatalization', type: 'ox', difficulty: '중',
    passage: '',
    question: "'끝인사'는 [끄친사]로 발음된다.",
    choices: [],
    answer: 'X',
    explanation: "'인사'는 실질 형태소이므로 구개음화가 일어나지 않습니다. 'ㅌ'이 대표음 [ㄷ]으로 바뀐 후 연음되어 [끄딘사]로 발음됩니다.",
  },
  {
    id: 'PL006', unitCode: 'palatalization', type: '단답형', difficulty: '상',
    passage: '',
    question: "'맏이'를 소리 나는 대로 쓰면? (대괄호 없이)",
    choices: [],
    answer: '마지',
    explanation: "'ㄷ'이 ㅣ로 시작하는 형식 형태소(접미사 '-이') 앞에서 'ㅈ'으로 바뀌어 [마지]로 발음됩니다. 학습지의 '굳이[구지]'와 같은 원리입니다.",
  },
  {
    id: 'PL007', unitCode: 'palatalization', type: '단답형', difficulty: '상',
    passage: '',
    question: "'밭이'를 소리 나는 대로 쓰면? (대괄호 없이)",
    choices: [],
    answer: '바치',
    explanation: "'ㅌ'이 ㅣ로 시작하는 형식 형태소(조사 '이') 앞에서 'ㅊ'으로 바뀌어 [바치]로 발음됩니다. '끝이[끄치]'와 같은 원리입니다.",
  },
  {
    id: 'PL008', unitCode: 'palatalization', type: '객관식', difficulty: '상',
    passage: '',
    question: "'붙이다'의 발음으로 알맞은 것은?",
    choices: ['[부티다]', '[부치다]', '[붇이다]', '[부디다]'],
    answer: '2',
    explanation: "'ㅌ'이 ㅣ로 시작하는 형식 형태소(접미사 '-이-') 앞에서 'ㅊ'으로 바뀌어 [부치다]로 발음됩니다. (구개음화)",
  },
  {
    id: 'PL009', unitCode: 'palatalization', type: 'ox', difficulty: '상',
    passage: '',
    question: "'밭에'는 [바체]로 발음된다.",
    choices: [],
    answer: 'X',
    explanation: "조사 '에'는 ㅣ나 반모음 ㅣ로 시작하지 않으므로 구개음화의 환경이 아닙니다. 받침이 그대로 연음되어 [바테]로 발음됩니다. 학습지의 '끝에[끄테]'와 같은 원리입니다.",
  },
  {
    id: 'PL010', unitCode: 'palatalization', type: '객관식', difficulty: '상',
    passage: '',
    question: "'미닫이'의 발음으로 알맞은 것은?",
    choices: ['[미다디]', '[미닫이]', '[미다지]', '[미다치]'],
    answer: '3',
    explanation: "'ㄷ'이 ㅣ로 시작하는 형식 형태소(접미사 '-이') 앞에서 'ㅈ'으로 바뀌어 [미다지]로 발음됩니다. 학습지의 '해돋이[해도지]'와 같은 원리입니다.",
  },
];

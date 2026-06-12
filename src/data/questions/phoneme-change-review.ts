import { Question } from '@/lib/types';

export const phonemeChangeReviewQuestions: Question[] = [
  // ── 끝소리 규칙 + 비음화 ──
  {
    id: 'PCR001', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '짓는', choices: [],
    answer: '음절의 끝소리 규칙/비음화',
    explanation: "'짓'의 받침 ㅅ → ㄷ(음절의 끝소리 규칙). 이어서 ㄷ이 ㄴ 앞에서 ㄴ으로 교체됩니다(비음화).",
    steps: [
      { result: '짇는', change: '음절의 끝소리 규칙' },
      { result: '진는', change: '비음화' },
    ],
  },
  {
    id: 'PCR002', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '있는', choices: [],
    answer: '음절의 끝소리 규칙/비음화',
    explanation: "'있'의 받침 ㅆ → ㄷ(음절의 끝소리 규칙). ㄷ이 ㄴ 앞에서 ㄴ으로 교체됩니다(비음화).",
    steps: [
      { result: '읻는', change: '음절의 끝소리 규칙' },
      { result: '인는', change: '비음화' },
    ],
  },
  {
    id: 'PCR003', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '꽃말', choices: [],
    answer: '음절의 끝소리 규칙/비음화',
    explanation: "'꽃'의 받침 ㅊ → ㄷ(음절의 끝소리 규칙). ㄷ이 ㅁ 앞에서 ㄴ으로 교체됩니다(비음화).",
    steps: [
      { result: '꼳말', change: '음절의 끝소리 규칙' },
      { result: '꼰말', change: '비음화' },
    ],
  },
  {
    id: 'PCR004', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '빗물', choices: [],
    answer: '음절의 끝소리 규칙/비음화',
    explanation: "'빗'의 받침 ㅅ → ㄷ(음절의 끝소리 규칙). ㄷ이 ㅁ 앞에서 ㄴ으로 교체됩니다(비음화).",
    steps: [
      { result: '빋물', change: '음절의 끝소리 규칙' },
      { result: '빈물', change: '비음화' },
    ],
  },
  {
    id: 'PCR005', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '벗는', choices: [],
    answer: '음절의 끝소리 규칙/비음화',
    explanation: "'벗'의 받침 ㅅ → ㄷ(음절의 끝소리 규칙). ㄷ이 ㄴ 앞에서 ㄴ으로 교체됩니다(비음화).",
    steps: [
      { result: '벋는', change: '음절의 끝소리 규칙' },
      { result: '번는', change: '비음화' },
    ],
  },
  {
    id: 'PCR006', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '겉모양', choices: [],
    answer: '음절의 끝소리 규칙/비음화',
    explanation: "'겉'의 받침 ㅌ → ㄷ(음절의 끝소리 규칙). ㄷ이 ㅁ 앞에서 ㄴ으로 교체됩니다(비음화).",
    steps: [
      { result: '걷모양', change: '음절의 끝소리 규칙' },
      { result: '건모양', change: '비음화' },
    ],
  },
  {
    id: 'PCR007', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '낮말', choices: [],
    answer: '음절의 끝소리 규칙/비음화',
    explanation: "'낮'의 받침 ㅈ → ㄷ(음절의 끝소리 규칙). ㄷ이 ㅁ 앞에서 ㄴ으로 교체됩니다(비음화).",
    steps: [
      { result: '낟말', change: '음절의 끝소리 규칙' },
      { result: '난말', change: '비음화' },
    ],
  },

  // ── 끝소리 규칙 + 된소리되기 ──
  {
    id: 'PCR008', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '읽다', choices: [],
    answer: '음절의 끝소리 규칙/된소리되기',
    explanation: "겹받침 ㄺ에서 ㄹ이 탈락하여 ㄱ만 남습니다(음절의 끝소리 규칙). 받침 ㄱ 뒤의 ㄷ이 ㄸ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '익다', change: '음절의 끝소리 규칙' },
      { result: '익따', change: '된소리되기' },
    ],
  },
  {
    id: 'PCR009', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '볶다', choices: [],
    answer: '음절의 끝소리 규칙/된소리되기',
    explanation: "받침 ㄲ → ㄱ(음절의 끝소리 규칙). 받침 ㄱ 뒤의 ㄷ이 ㄸ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '복다', change: '음절의 끝소리 규칙' },
      { result: '복따', change: '된소리되기' },
    ],
  },
  {
    id: 'PCR010', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '맺다', choices: [],
    answer: '음절의 끝소리 규칙/된소리되기',
    explanation: "'맺'의 받침 ㅈ → ㄷ(음절의 끝소리 규칙). 받침 ㄷ 뒤의 ㄷ이 ㄸ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '맫다', change: '음절의 끝소리 규칙' },
      { result: '맫따', change: '된소리되기' },
    ],
  },
  {
    id: 'PCR011', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '꽃다발', choices: [],
    answer: '음절의 끝소리 규칙/된소리되기',
    explanation: "'꽃'의 받침 ㅊ → ㄷ(음절의 끝소리 규칙). 받침 ㄷ 뒤의 ㄷ이 ㄸ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '꼳다발', change: '음절의 끝소리 규칙' },
      { result: '꼳따발', change: '된소리되기' },
    ],
  },
  {
    id: 'PCR012', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '젖소', choices: [],
    answer: '음절의 끝소리 규칙/된소리되기',
    explanation: "'젖'의 받침 ㅈ → ㄷ(음절의 끝소리 규칙). 받침 ㄷ 뒤의 ㅅ이 ㅆ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '젇소', change: '음절의 끝소리 규칙' },
      { result: '젇쏘', change: '된소리되기' },
    ],
  },
  {
    id: 'PCR013', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '긁다', choices: [],
    answer: '음절의 끝소리 규칙/된소리되기',
    explanation: "겹받침 ㄺ에서 ㄹ이 탈락하여 ㄱ만 남습니다(음절의 끝소리 규칙). 받침 ㄱ 뒤의 ㄷ이 ㄸ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '극다', change: '음절의 끝소리 규칙' },
      { result: '극따', change: '된소리되기' },
    ],
  },
  {
    id: 'PCR014', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '삶다', choices: [],
    answer: '음절의 끝소리 규칙/된소리되기',
    explanation: "겹받침 ㄻ에서 ㄹ이 탈락하여 ㅁ만 남습니다(음절의 끝소리 규칙). 어간 받침 ㅁ 뒤의 ㄷ이 ㄸ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '삼다', change: '음절의 끝소리 규칙' },
      { result: '삼따', change: '된소리되기' },
    ],
  },

  // ── 끝소리 규칙 + 거센소리되기 ──
  // ⚠️ 받침 ㅈ + 히 (맞히다, 잊히다 등)는 ㅊ으로 바로 축약되므로
  //    (거센소리되기 한 번만 적용) 이 유형에 쓰면 안 됩니다.
  {
    id: 'PCR015', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '비슷하다', choices: [],
    answer: '음절의 끝소리 규칙/거센소리되기',
    explanation: "'슷'의 받침 ㅅ → ㄷ(음절의 끝소리 규칙). ㄷ과 ㅎ이 만나 ㅌ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '비슫하다', change: '음절의 끝소리 규칙' },
      { result: '비스타다', change: '거센소리되기' },
    ],
  },
  {
    id: 'PCR016', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '따뜻한', choices: [],
    answer: '음절의 끝소리 규칙/거센소리되기',
    explanation: "'뜻'의 받침 ㅅ → ㄷ(음절의 끝소리 규칙). ㄷ과 ㅎ이 만나 ㅌ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '따뜯한', change: '음절의 끝소리 규칙' },
      { result: '따뜨탄', change: '거센소리되기' },
    ],
  },
  {
    id: 'PCR017', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '꽃향기', choices: [],
    answer: '음절의 끝소리 규칙/거센소리되기',
    explanation: "'꽃'의 받침 ㅊ → ㄷ(음절의 끝소리 규칙). ㄷ과 ㅎ이 만나 ㅌ으로 축약되어 다음 음절 초성이 됩니다(거센소리되기).",
    steps: [
      { result: '꼳향기', change: '음절의 끝소리 규칙' },
      { result: '꼬턍기', change: '거센소리되기' },
    ],
  },
  {
    id: 'PCR018', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '깨끗한', choices: [],
    answer: '음절의 끝소리 규칙/거센소리되기',
    explanation: "'끗'의 받침 ㅅ → ㄷ(음절의 끝소리 규칙). ㄷ과 ㅎ이 만나 ㅌ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '깨끋한', change: '음절의 끝소리 규칙' },
      { result: '깨끄탄', change: '거센소리되기' },
    ],
  },

  // ── 비음화 + 거센소리되기 ──
  {
    id: 'PCR019', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '적막한', choices: [],
    answer: '비음화/거센소리되기',
    explanation: "'적'의 받침 ㄱ이 ㅁ 앞에서 ㅇ으로 교체됩니다(비음화). '막'의 받침 ㄱ과 ㅎ이 만나 ㅋ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '정막한', change: '비음화' },
      { result: '정마칸', change: '거센소리되기' },
    ],
  },
  {
    id: 'PCR020', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '묵묵한', choices: [],
    answer: '비음화/거센소리되기',
    explanation: "첫째 '묵'의 ㄱ이 ㅁ 앞에서 ㅇ으로 교체됩니다(비음화). 둘째 '묵'의 ㄱ과 ㅎ이 만나 ㅋ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '뭉묵한', change: '비음화' },
      { result: '뭉무칸', change: '거센소리되기' },
    ],
  },
  {
    id: 'PCR021', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '삭막한', choices: [],
    answer: '비음화/거센소리되기',
    explanation: "'삭'의 받침 ㄱ이 ㅁ 앞에서 ㅇ으로 교체됩니다(비음화). '막'의 받침 ㄱ과 ㅎ이 만나 ㅋ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '상막한', change: '비음화' },
      { result: '상마칸', change: '거센소리되기' },
    ],
  },

  // ── 된소리되기 + 거센소리되기 ──
  {
    id: 'PCR022', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '복잡한', choices: [],
    answer: '된소리되기/거센소리되기',
    explanation: "'복'의 받침 ㄱ 뒤의 ㅈ이 ㅉ으로 교체됩니다(된소리되기). '잡'의 받침 ㅂ과 ㅎ이 만나 ㅍ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '복짭한', change: '된소리되기' },
      { result: '복짜판', change: '거센소리되기' },
    ],
  },
  {
    id: 'PCR023', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '약속한', choices: [],
    answer: '된소리되기/거센소리되기',
    explanation: "'약'의 받침 ㄱ 뒤의 ㅅ이 ㅆ으로 교체됩니다(된소리되기). '속'의 받침 ㄱ과 ㅎ이 만나 ㅋ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '약쏙한', change: '된소리되기' },
      { result: '약쏘칸', change: '거센소리되기' },
    ],
  },

  // ── 연음 + 구개음화 ──
  {
    id: 'PCR024', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '하',
    passage: '', question: '끝이', choices: [],
    answer: '연음/구개음화',
    explanation: "받침 ㅌ이 모음 '이' 앞으로 연음됩니다. 형식 형태소 '이' 앞에서 ㅌ → ㅊ으로 교체됩니다(구개음화).",
    steps: [
      { result: '끄티', change: '연음' },
      { result: '끄치', change: '구개음화' },
    ],
  },
  {
    id: 'PCR025', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '하',
    passage: '', question: '밭이', choices: [],
    answer: '연음/구개음화',
    explanation: "받침 ㅌ이 모음 '이' 앞으로 연음됩니다. 형식 형태소 '이' 앞에서 ㅌ → ㅊ으로 교체됩니다(구개음화).",
    steps: [
      { result: '바티', change: '연음' },
      { result: '바치', change: '구개음화' },
    ],
  },
  {
    id: 'PCR026', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '하',
    passage: '', question: '해돋이', choices: [],
    answer: '연음/구개음화',
    explanation: "받침 ㄷ이 모음 '이' 앞으로 연음됩니다. 형식 형태소 '이' 앞에서 ㄷ → ㅈ으로 교체됩니다(구개음화).",
    steps: [
      { result: '해도디', change: '연음' },
      { result: '해도지', change: '구개음화' },
    ],
  },

  // ── ㄹ의 비음화 + 비음화 ──
  {
    id: 'PCR027', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '독립', choices: [],
    answer: 'ㄹ의 비음화/비음화',
    explanation: "ㄱ 뒤의 ㄹ이 ㄴ으로 교체됩니다(ㄹ의 비음화). 이어서 ㄱ이 ㄴ 앞에서 ㅇ으로 교체됩니다(비음화).",
    steps: [
      { result: '독닙', change: 'ㄹ의 비음화' },
      { result: '동닙', change: '비음화' },
    ],
  },
  {
    id: 'PCR028', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '협력', choices: [],
    answer: 'ㄹ의 비음화/비음화',
    explanation: "ㅂ 뒤의 ㄹ이 ㄴ으로 교체됩니다(ㄹ의 비음화). 이어서 ㅂ이 ㄴ 앞에서 ㅁ으로 교체됩니다(비음화).",
    steps: [
      { result: '협녁', change: 'ㄹ의 비음화' },
      { result: '혐녁', change: '비음화' },
    ],
  },

  // ── 유음화 + 거센소리되기 ──
  {
    id: 'PCR029', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '연락한', choices: [],
    answer: '유음화/거센소리되기',
    explanation: "'연'의 ㄴ이 ㄹ 앞에서 ㄹ로 교체됩니다(유음화). '락'의 받침 ㄱ과 ㅎ이 만나 ㅋ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '열락한', change: '유음화' },
      { result: '열라칸', change: '거센소리되기' },
    ],
  },

  // ── ㄹ의 비음화 + 비음화 ──
  {
    id: 'PCR030', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '법률', choices: [],
    answer: 'ㄹ의 비음화/비음화',
    explanation: "ㅂ 뒤의 ㄹ이 ㄴ으로 교체됩니다(ㄹ의 비음화). 이어서 ㅂ이 ㄴ 앞에서 ㅁ으로 교체됩니다(비음화).",
    steps: [
      { result: '법뉼', change: 'ㄹ의 비음화' },
      { result: '범뉼', change: '비음화' },
    ],
  },
];

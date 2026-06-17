import { Question } from '@/lib/types';

export const phonemeChangeReviewQuestions: Question[] = [
  // ── 1회 변동 ──
  {
    id: 'PCR001', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '하',
    passage: '', question: '국물', choices: [],
    answer: '비음화',
    explanation: "'국'의 받침 ㄱ이 ㅁ 앞에서 ㅇ으로 교체됩니다(비음화).",
    steps: [
      { result: '궁물', change: '비음화' },
    ],
  },
  {
    id: 'PCR002', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '하',
    passage: '', question: '신라', choices: [],
    answer: '유음화',
    explanation: "'신'의 받침 ㄴ이 ㄹ 앞에서 ㄹ로 교체됩니다(유음화).",
    steps: [
      { result: '실라', change: '유음화' },
    ],
  },
  {
    id: 'PCR003', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '하',
    passage: '', question: '좋다', choices: [],
    answer: '거센소리되기',
    explanation: "'좋'의 받침 ㅎ과 ㄷ이 만나 ㅌ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '조타', change: '거센소리되기' },
    ],
  },
  {
    id: 'PCR004', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '하',
    passage: '', question: '굳이', choices: [],
    answer: '구개음화',
    explanation: "'굳'의 받침 ㄷ이 모음 ㅣ 앞에서 ㅈ으로 교체됩니다(구개음화).",
    steps: [
      { result: '구지', change: '구개음화' },
    ],
  },
  {
    id: 'PCR005', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '하',
    passage: '', question: '낳은', choices: [],
    answer: 'ㅎ 탈락',
    explanation: "어간 '낳'의 받침 ㅎ이 모음 어미 '-은' 앞에서 탈락합니다(ㅎ 탈락).",
    steps: [
      { result: '나은', change: 'ㅎ 탈락' },
    ],
  },

  // ── 끝소리 규칙 + 비음화 ──
  {
    id: 'PCR006', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '짓는', choices: [],
    answer: '음절의 끝소리 규칙/비음화',
    explanation: "'짓'의 받침 ㅅ → ㄷ(음절의 끝소리 규칙). ㄷ이 ㄴ 앞에서 ㄴ으로 교체됩니다(비음화).",
    steps: [
      { result: '짇는', change: '음절의 끝소리 규칙' },
      { result: '진는', change: '비음화' },
    ],
  },
  {
    id: 'PCR007', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '꽃말', choices: [],
    answer: '음절의 끝소리 규칙/비음화',
    explanation: "'꽃'의 받침 ㅊ → ㄷ(음절의 끝소리 규칙). ㄷ이 ㅁ 앞에서 ㄴ으로 교체됩니다(비음화).",
    steps: [
      { result: '꼳말', change: '음절의 끝소리 규칙' },
      { result: '꼰말', change: '비음화' },
    ],
  },
  {
    id: 'PCR008', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '앞마당', choices: [],
    answer: '음절의 끝소리 규칙/비음화',
    explanation: "'앞'의 받침 ㅍ → ㅂ(음절의 끝소리 규칙). ㅂ이 ㅁ 앞에서 ㅁ으로 교체됩니다(비음화).",
    steps: [
      { result: '압마당', change: '음절의 끝소리 규칙' },
      { result: '암마당', change: '비음화' },
    ],
  },
  {
    id: 'PCR009', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '부엌문', choices: [],
    answer: '음절의 끝소리 규칙/비음화',
    explanation: "'엌'의 받침 ㅋ → ㄱ(음절의 끝소리 규칙). ㄱ이 ㅁ 앞에서 ㅇ으로 교체됩니다(비음화).",
    steps: [
      { result: '부억문', change: '음절의 끝소리 규칙' },
      { result: '부엉문', change: '비음화' },
    ],
  },

  // ── 자음군 단순화 + 된소리되기 ──
  {
    id: 'PCR010', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '읽다', choices: [],
    answer: '자음군 단순화/된소리되기',
    explanation: "겹받침 ㄺ에서 ㄹ이 탈락하여 ㄱ만 남습니다(자음군 단순화). 받침 ㄱ 뒤의 ㄷ이 ㄸ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '익다', change: '자음군 단순화' },
      { result: '익따', change: '된소리되기' },
    ],
  },
  {
    id: 'PCR011', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '긁다', choices: [],
    answer: '자음군 단순화/된소리되기',
    explanation: "겹받침 ㄺ에서 ㄹ이 탈락하여 ㄱ만 남습니다(자음군 단순화). 받침 ㄱ 뒤의 ㄷ이 ㄸ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '극다', change: '자음군 단순화' },
      { result: '극따', change: '된소리되기' },
    ],
  },
  {
    id: 'PCR012', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '삶다', choices: [],
    answer: '자음군 단순화/된소리되기',
    explanation: "겹받침 ㄻ에서 ㄹ이 탈락하여 ㅁ만 남습니다(자음군 단순화). 어간 받침 ㅁ 뒤의 ㄷ이 ㄸ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '삼다', change: '자음군 단순화' },
      { result: '삼따', change: '된소리되기' },
    ],
  },

  // ── 끝소리 규칙 + 된소리되기 ──
  {
    id: 'PCR013', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '꽃다발', choices: [],
    answer: '음절의 끝소리 규칙/된소리되기',
    explanation: "'꽃'의 받침 ㅊ → ㄷ(음절의 끝소리 규칙). 받침 ㄷ 뒤의 ㄷ이 ㄸ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '꼳다발', change: '음절의 끝소리 규칙' },
      { result: '꼳따발', change: '된소리되기' },
    ],
  },
  {
    id: 'PCR014', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '옆집', choices: [],
    answer: '음절의 끝소리 규칙/된소리되기',
    explanation: "'옆'의 받침 ㅍ → ㅂ(음절의 끝소리 규칙). 받침 ㅂ 뒤의 ㅈ이 ㅉ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '엽집', change: '음절의 끝소리 규칙' },
      { result: '엽찝', change: '된소리되기' },
    ],
  },
  {
    id: 'PCR015', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '젖소', choices: [],
    answer: '음절의 끝소리 규칙/된소리되기',
    explanation: "'젖'의 받침 ㅈ → ㄷ(음절의 끝소리 규칙). 받침 ㄷ 뒤의 ㅅ이 ㅆ으로 교체됩니다(된소리되기).",
    steps: [
      { result: '젇소', change: '음절의 끝소리 규칙' },
      { result: '젇쏘', change: '된소리되기' },
    ],
  },

  // ── 끝소리 규칙 + 거센소리되기 ──
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

  // ── 비음화 + 거센소리되기 ──
  {
    id: 'PCR018', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '막막한', choices: [],
    answer: '비음화/거센소리되기',
    explanation: "첫 음절 '막'의 받침 ㄱ이 ㅁ 앞에서 ㅇ으로 교체됩니다(비음화). 둘째 음절 '막'의 받침 ㄱ과 '한'의 ㅎ이 만나 ㅋ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '망막한', change: '비음화' },
      { result: '망마칸', change: '거센소리되기' },
    ],
  },
  {
    id: 'PCR019', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
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
    id: 'PCR020', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '복잡한', choices: [],
    answer: '된소리되기/거센소리되기',
    explanation: "'복'의 받침 ㄱ 뒤의 ㅈ이 ㅉ으로 교체됩니다(된소리되기). '잡'의 받침 ㅂ과 ㅎ이 만나 ㅍ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '복짭한', change: '된소리되기' },
      { result: '복짜판', change: '거센소리되기' },
    ],
  },
  {
    id: 'PCR021', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '약속한', choices: [],
    answer: '된소리되기/거센소리되기',
    explanation: "'약'의 받침 ㄱ 뒤의 ㅅ이 ㅆ으로 교체됩니다(된소리되기). '속'의 받침 ㄱ과 ㅎ이 만나 ㅋ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '약쏙한', change: '된소리되기' },
      { result: '약쏘칸', change: '거센소리되기' },
    ],
  },

  // ── ㄹ의 비음화 + 비음화 (2문제만) ──
  {
    id: 'PCR022', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '독립', choices: [],
    answer: 'ㄹ의 비음화/비음화',
    explanation: "ㄱ 뒤의 ㄹ이 ㄴ으로 교체됩니다(ㄹ의 비음화). 이어서 ㄱ이 ㄴ 앞에서 ㅇ으로 교체됩니다(비음화).",
    steps: [
      { result: '독닙', change: 'ㄹ의 비음화' },
      { result: '동닙', change: '비음화' },
    ],
  },
  {
    id: 'PCR023', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
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
    id: 'PCR024', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '연락한', choices: [],
    answer: '유음화/거센소리되기',
    explanation: "'연'의 ㄴ이 ㄹ 앞에서 ㄹ로 교체됩니다(유음화). '락'의 받침 ㄱ과 ㅎ이 만나 ㅋ으로 축약됩니다(거센소리되기).",
    steps: [
      { result: '열락한', change: '유음화' },
      { result: '열라칸', change: '거센소리되기' },
    ],
  },

  // ── 자음군 단순화 + 비음화 ──
  {
    id: 'PCR025', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '읽는', choices: [],
    answer: '자음군 단순화/비음화',
    explanation: "겹받침 ㄺ에서 ㄹ이 탈락하여 ㄱ만 남습니다(자음군 단순화). ㄱ이 ㄴ 앞에서 ㅇ으로 교체됩니다(비음화).",
    steps: [
      { result: '익는', change: '자음군 단순화' },
      { result: '잉는', change: '비음화' },
    ],
  },

  // ── 구개음화 관련 ──
  {
    id: 'PCR026', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '같이', choices: [],
    answer: '구개음화',
    explanation: "'같'의 받침 ㅌ(ㅊ→ㄷ→ㅌ)이 모음 ㅣ 앞에서 ㅊ으로 교체됩니다(구개음화).",
    steps: [
      { result: '가치', change: '구개음화' },
    ],
  },

  // ── 4회 변동: 끝소리 규칙 + 거센소리되기 + 자음군 단순화 + 유음화 ──
  {
    id: 'PCR027', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '겉핥는', choices: [],
    answer: '음절의 끝소리 규칙/거센소리되기/자음군 단순화/유음화',
    explanation: "'겉'의 받침 ㅌ → ㄷ(음절의 끝소리 규칙). ㄷ과 '핥'의 ㅎ이 만나 ㅌ으로 축약됩니다(거센소리되기). 겹받침 ㄾ에서 ㅌ이 탈락하여 ㄹ만 남습니다(자음군 단순화). 이어서 ㄹ 뒤의 ㄴ이 ㄹ로 교체됩니다(유음화).",
    steps: [
      { result: '걷핥는', change: '음절의 끝소리 규칙' },
      { result: '거탍는', change: '거센소리되기' },
      { result: '거탈는', change: '자음군 단순화' },
      { result: '거탈른', change: '유음화' },
    ],
  },

  // ── 거센소리되기 + 구개음화 ──
  {
    id: 'PCR028', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '굳히다', choices: [],
    answer: '거센소리되기/구개음화',
    explanation: "'굳'의 받침 ㄷ과 '히'의 ㅎ이 만나 ㅌ으로 축약됩니다(거센소리되기). 이어서 ㅌ이 모음 ㅣ 앞에서 ㅊ으로 교체됩니다(구개음화).",
    steps: [
      { result: '구티다', change: '거센소리되기' },
      { result: '구치다', change: '구개음화' },
    ],
  },

  // ── ㅎ 탈락 관련 ──
  {
    id: 'PCR029', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '중',
    passage: '', question: '쌓아', choices: [],
    answer: 'ㅎ 탈락',
    explanation: "어간 '쌓'의 받침 ㅎ이 모음 어미 '-아' 앞에서 탈락합니다(ㅎ 탈락).",
    steps: [
      { result: '싸아', change: 'ㅎ 탈락' },
    ],
  },

  // ── 자음군 단순화 + 비음화 + 거센소리되기 (3회) ──
  {
    id: 'PCR030', unitCode: 'phoneme-change-review', type: '변동분석', difficulty: '상',
    passage: '', question: '밟는', choices: [],
    answer: '자음군 단순화/비음화',
    explanation: "겹받침 ㄼ에서 ㄹ이 탈락하여 ㅂ만 남습니다(자음군 단순화). ㅂ이 ㄴ 앞에서 ㅁ으로 교체됩니다(비음화).",
    steps: [
      { result: '밥는', change: '자음군 단순화' },
      { result: '밤는', change: '비음화' },
    ],
  },
];

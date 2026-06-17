export type QuestionType = '객관식' | 'ox' | '빈칸' | '단답형' | '변동분석';

export interface PhonemeChangeStep {
  result: string;
  change: string;
}

export type Difficulty = '상' | '중' | '하';

export interface Category {
  code: string;
  name: string;
  description: string;
  order: number;
}

export interface UnitBlock {
  code: string;
  name: string;
  description: string;
}

export interface Unit {
  code: string;
  category: string; // 중분류 코드 (categories.ts의 code)
  name: string;
  description: string;
  order: number;
  active: boolean;
  advanced?: boolean;    // true면 '고난도 도전' 섹션에 표시
  summary?: boolean;     // true면 '총정리' 섹션에 표시
  study?: boolean;       // true면 퀴즈 대신 인출 연습 UI
  parentCode?: string;   // 분할 소단원의 원본 unitCode (questions 필터용)
  partIndex?: number;    // 분할 소단원 번호 (0, 1, 2)
  blocks?: UnitBlock[];  // 블록 목록 (있으면 블록별 선택 UI)
}

export interface StudyCardTable {
  headers: string[];
  rows: string[][];
}

export interface StudyCardReveal {
  label: string;
  content?: string;          // 텍스트 답
  table?: StudyCardTable;    // 표 답
}

export interface StudyCard {
  id: string;
  name: string;
  group?: string;              // 상위 분류 배지 (예: "높임 표현")
  examples?: string[];         // 음운: 예시(초록) / 문법: 예문(인출 단서)
  nonExamples?: string[];      // 음운만 (있을 때만 비예시 배지)
  exampleLabel?: string;       // 단서 섹션 라벨 (문법은 "예문", 기본 "예시")
  definition?: string;         // 레거시 음운 카드용
  formula?: string;            // 레거시
  nonExampleReason?: string;   // 레거시
  reveals?: StudyCardReveal[]; // 있으면 이 항목들을 인출칸으로 렌더(가변 개수)
}

export interface Question {
  id: string;
  unitCode: string;
  type: QuestionType;
  difficulty: Difficulty;
  passage: string;
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
  steps?: PhonemeChangeStep[];
  block?: string;          // 블록 코드 (Unit.blocks의 code와 대응)
}

export interface StudentProfile {
  name: string;
  studentId: string;
}

export interface QuizAttempt {
  unitCode: string;
  date: string;
  score: number;
  total: number;
  completed?: boolean; // false면 중간 종료한 기록 (최고 점수 집계에서 제외)
  full?: boolean;      // 전부 풀기 여부 (랜덤 모드는 false; 레거시 undefined는 전부 풀기로 간주)
  answers: AnswerRecord[];
  attemptId?: string;  // 동기화 멱등키 (신규 기록은 uuid, 레거시는 sync 시 해시 폴백)
}

export interface AnswerRecord {
  questionId: string;
  questionText: string;
  explanation: string;
  studentAnswer: string;
  correctAnswer: string;
  correct: boolean;
  unitCode?: string;
}

export interface ReviewScheduleEntry {
  box: number;
  due: string;
  wrongCount: number;
  unitCode: string;
}

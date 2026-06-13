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

export interface Unit {
  code: string;
  category: string; // 중분류 코드 (categories.ts의 code)
  name: string;
  description: string;
  order: number;
  active: boolean;
  advanced?: boolean; // true면 '고난도 도전' 섹션에 표시
  summary?: boolean;  // true면 '총정리' 섹션에 표시
  study?: boolean;    // true면 퀴즈 대신 인출 연습 UI
}

export interface StudyCard {
  id: string;
  name: string;
  examples: string[];
  nonExamples: string[];
  definition: string;
  formula: string;
  nonExampleReason: string;
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
  answers: AnswerRecord[];
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

// 학습지 묶음 (학생용/교사용 통합본)
export interface Worksheet {
  title: string;        // 화면에 표시될 이름
  studentFile?: string; // public/materials/ 안의 학생용 파일명
  teacherFile?: string; // public/materials/ 안의 교사용 파일명
  order: number;
}

// 추가 자료 (개별 파일)
export interface Supplement {
  title: string;       // 자료 제목
  fileName: string;    // public/materials/ 안의 파일명
  description?: string; // 간단한 설명 (선택)
  order: number;
}

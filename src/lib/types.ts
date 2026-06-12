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

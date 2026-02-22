export type QuestionType = '객관식' | 'ox' | '빈칸' | '단답형';

export type Difficulty = '상' | '중' | '하';

export interface Unit {
  code: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
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
  answers: AnswerRecord[];
}

export interface AnswerRecord {
  questionId: string;
  studentAnswer: string;
  correctAnswer: string;
  correct: boolean;
}

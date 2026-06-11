'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Question, AnswerRecord } from '@/lib/types';
import { saveQuizResult, markQuestionResolved, unmarkQuestionResolved } from '@/lib/storage';

// 문제 순서 셔플 (학생이 문제 순서를 외우는 것 방지)
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface QuizRunnerProps {
  unitCode: string;
  questions: Question[];
  // 오답 노트 복습 모드: 결과를 저장하지 않고, 맞힌 문제를 오답 노트에서 해결 처리
  reviewMode?: boolean;
}

export default function QuizRunner({ unitCode, questions: initialQuestions, reviewMode = false }: QuizRunnerProps) {
  const router = useRouter();
  // SSG로 생성된 페이지와의 hydration 불일치를 피하기 위해
  // 셔플은 마운트 후 useEffect에서 수행
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [blankAnswers, setBlankAnswers] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [reviewFinished, setReviewFinished] = useState(false);

  useEffect(() => {
    setQuestions(shuffle(initialQuestions));
  }, [initialQuestions]);

  const question = questions?.[currentIndex];
  const progress = questions ? (currentIndex / questions.length) * 100 : 0;

  const blankCount = question?.type === '빈칸'
    ? (question.question.match(/\[___\]/g) || []).length || 1
    : 0;

  const checkAnswer = useCallback(() => {
    if (!question) return;

    let studentAnswer = '';
    let correct = false;

    switch (question.type) {
      case '객관식': {
        studentAnswer = selectedAnswer;
        correct = selectedAnswer === question.answer;
        break;
      }
      case 'ox': {
        studentAnswer = selectedAnswer;
        correct = selectedAnswer.toUpperCase() === question.answer.toUpperCase();
        break;
      }
      case '빈칸': {
        studentAnswer = blankAnswers.join('/');
        const expectedParts = question.answer.split('/').map(s => s.trim());
        correct = blankAnswers.length === expectedParts.length &&
          blankAnswers.every((a, i) => a.trim() === expectedParts[i]);
        break;
      }
      case '단답형': {
        studentAnswer = selectedAnswer.trim();
        const acceptableAnswers = question.answer.split('|').map(s => s.trim());
        correct = acceptableAnswers.some(a => a === studentAnswer);
        break;
      }
    }

    setIsCorrect(correct);
    setShowFeedback(true);
    setAnswers(prev => [...prev, {
      questionId: question.id,
      questionText: question.question,
      explanation: question.explanation,
      studentAnswer,
      correctAnswer: question.answer,
      correct,
    }]);

    // 복습 모드: 맞히면 오답 노트에서 해결 처리, 다시 틀리면 해결 취소
    if (reviewMode) {
      if (correct) markQuestionResolved(question.id);
      else unmarkQuestionResolved(question.id);
    }
  }, [question, selectedAnswer, blankAnswers, reviewMode]);

  const goNext = () => {
    if (!questions) return;
    if (currentIndex + 1 >= questions.length) {
      if (reviewMode) {
        // 복습 모드는 결과를 저장하지 않고 완료 화면 표시
        setReviewFinished(true);
        return;
      }
      saveQuizResult({
        unitCode,
        date: new Date().toISOString(),
        score: answers.filter(a => a.correct).length,
        total: questions.length,
        completed: true,
        answers,
      });
      router.push(`/units/${unitCode}/result`);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer('');
    setBlankAnswers([]);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  // 조기 종료: 푼 문제가 있으면 결과를 저장해 오답 노트에 반영
  const exitQuiz = () => {
    if (reviewMode) {
      // 복습 모드는 문제별로 즉시 해결 처리되므로 저장 없이 종료
      const message = answers.length > 0
        ? `복습을 종료할까요?\n지금까지 맞힌 문제는 오답 노트에서 해결 처리되었습니다.`
        : '복습을 종료할까요?';
      if (confirm(message)) router.push('/review');
      return;
    }
    if (answers.length === 0) {
      if (confirm('퀴즈를 종료할까요?\n아직 푼 문제가 없어 기록이 저장되지 않습니다.')) {
        router.push(`/units/${unitCode}`);
      }
      return;
    }
    const wrongCount = answers.filter(a => !a.correct).length;
    const message =
      `지금까지 푼 ${answers.length}문제의 결과를 저장하고 종료할까요?` +
      (wrongCount > 0 ? `\n틀린 ${wrongCount}문제는 오답 노트에 기록됩니다.` : '');
    if (confirm(message)) {
      saveQuizResult({
        unitCode,
        date: new Date().toISOString(),
        score: answers.filter(a => a.correct).length,
        total: answers.length,
        completed: false,
        answers,
      });
      router.push(`/units/${unitCode}/result`);
    }
  };

  // 복습 모드 완료 화면
  if (reviewFinished) {
    const correctCount = answers.filter(a => a.correct).length;
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-surface rounded-2xl border border-border p-8">
          <h1 className="text-2xl font-bold mb-3">복습 완료!</h1>
          <p className="text-lg mb-2">
            <span className="font-bold">{answers.length}</span>문제 중{' '}
            <span className="font-bold text-success">{correctCount}</span>문제 정답
          </p>
          <p className="text-text-secondary text-sm mb-8">
            맞힌 문제는 오답 노트에서 해결 처리되었습니다.
            {correctCount < answers.length && ' 틀린 문제는 오답 노트에 남아 있습니다.'}
          </p>
          <div className="flex gap-3">
            <Link
              href="/review"
              className="flex-1 py-3 text-center bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              오답 노트로
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 text-center border border-border rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              학습 영역 선택
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 셔플 완료 전 (마운트 직후) 로딩 표시
  if (!questions || !question) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">문제를 준비하는 중...</p>
      </div>
    );
  }

  const canSubmit =
    question.type === '빈칸'
      ? blankAnswers.length >= blankCount && blankAnswers.every(a => a.trim() !== '')
      : selectedAnswer.trim() !== '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Exit button (early exit saves partial results) */}
      <button
        onClick={exitQuiz}
        className="inline-block text-sm text-text-secondary hover:text-primary mb-4"
      >
        &larr; 나가기
      </button>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-text-secondary mb-2">
          <span>{currentIndex + 1} / {questions.length}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            question.difficulty === '상' ? 'bg-error-light text-error' :
            question.difficulty === '중' ? 'bg-warning-light text-warning' :
            'bg-success-light text-success'
          }`}>
            {question.difficulty}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-4">
        <span className="inline-block text-xs font-medium text-primary bg-primary-light px-2.5 py-1 rounded-full mb-3">
          {question.type === 'ox' ? 'O/X' : question.type}
        </span>

        {question.passage && (
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-4 text-sm leading-relaxed border border-gray-100 dark:border-white/10 whitespace-pre-line">
            {question.passage}
          </div>
        )}

        <p className="text-lg font-medium leading-relaxed mb-6">{question.question}</p>

        {/* Answer area */}
        {!showFeedback && (
          <div className="space-y-3">
            {question.type === '객관식' && question.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswer(String(idx + 1))}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-base ${
                  selectedAnswer === String(idx + 1)
                    ? 'border-primary bg-primary-light'
                    : 'border-border hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 text-sm font-semibold mr-3">
                  {idx + 1}
                </span>
                {choice}
              </button>
            ))}

            {question.type === 'ox' && (
              <div className="flex gap-4">
                {['O', 'X'].map(val => (
                  <button
                    key={val}
                    onClick={() => setSelectedAnswer(val)}
                    className={`flex-1 py-6 rounded-xl border-2 text-3xl font-bold transition-all ${
                      selectedAnswer === val
                        ? val === 'O'
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-error bg-error-light text-error'
                        : 'border-border hover:border-gray-300 dark:hover:border-white/20'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}

            {question.type === '빈칸' && (
              <div className="space-y-3">
                {Array.from({ length: blankCount }, (_, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={blankAnswers[idx] || ''}
                    onChange={e => {
                      const newAnswers = [...blankAnswers];
                      newAnswers[idx] = e.target.value;
                      setBlankAnswers(newAnswers);
                    }}
                    placeholder={`빈칸 ${idx + 1}`}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border focus:outline-none focus:border-primary text-base"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            )}

            {question.type === '단답형' && (
              <input
                type="text"
                value={selectedAnswer}
                onChange={e => setSelectedAnswer(e.target.value)}
                placeholder="답을 입력하세요"
                className="w-full px-4 py-3 rounded-xl border-2 border-border focus:outline-none focus:border-primary text-base"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter' && canSubmit) checkAnswer(); }}
              />
            )}
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className={`rounded-xl p-5 ${isCorrect ? 'bg-success-light' : 'bg-error-light'}`}>
            <p className={`font-bold text-lg mb-2 ${isCorrect ? 'text-success' : 'text-error'}`}>
              {isCorrect ? '정답입니다!' : '틀렸습니다'}
            </p>
            {!isCorrect && (
              <p className="text-sm mb-2">
                <span className="font-medium">정답:</span>{' '}
                {question.type === '객관식'
                  ? `${question.answer}번 - ${question.choices[parseInt(question.answer) - 1] ?? ''}`
                  : question.answer}
              </p>
            )}
            <p className="text-sm leading-relaxed text-text">{question.explanation}</p>
          </div>
        )}
      </div>

      {/* Action button */}
      {!showFeedback ? (
        <button
          onClick={checkAnswer}
          disabled={!canSubmit}
          className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          정답 확인
        </button>
      ) : (
        <button
          onClick={goNext}
          className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors"
        >
          {currentIndex + 1 >= questions.length
            ? (reviewMode ? '복습 완료' : '결과 보기')
            : '다음 문제'}
        </button>
      )}
    </div>
  );
}

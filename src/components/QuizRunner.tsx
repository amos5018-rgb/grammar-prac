'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Question, AnswerRecord } from '@/lib/types';
import { saveQuizResult, updateReviewState } from '@/lib/storage';
import PhonemeChangeExercise from './PhonemeChangeExercise';

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
  reviewMode?: boolean;
  exitHref?: string;
  shuffleOnly?: boolean;
}

export default function QuizRunner({ unitCode, questions: initialQuestions, reviewMode = false, exitHref, shuffleOnly = false }: QuizRunnerProps) {
  const router = useRouter();
  const alwaysShuffle = shuffleOnly || reviewMode;
  const [shuffled, setShuffled] = useState(alwaysShuffle);
  const [questions, setQuestions] = useState(() => alwaysShuffle ? shuffle(initialQuestions) : initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [blankAnswers, setBlankAnswers] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [reviewFinished, setReviewFinished] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const backHref = exitHref ?? `/units/${unitCode}`;
  const hasResultPage = !exitHref;

  const canShuffle = answers.length === 0 && !showFeedback;

  const toggleShuffle = () => {
    if (!canShuffle) return;
    if (shuffled) {
      setQuestions(initialQuestions);
      setShuffled(false);
    } else {
      setQuestions(shuffle(initialQuestions));
      setShuffled(true);
    }
    setCurrentIndex(0);
    setSelectedAnswer('');
    setBlankAnswers([]);
  };

  const question = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;

  const blankCount = question?.type === '빈칸'
    ? (question.question.match(/\[___\]/g) || []).length || 1
    : question?.type === '변동분석'
      ? (question.steps?.length || 0)
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
      case '변동분석': {
        studentAnswer = blankAnswers.join(' → ');
        const expectedSteps = question.steps || [];
        correct = blankAnswers.length === expectedSteps.length &&
          blankAnswers.every((a, i) => a === expectedSteps[i].change);
        break;
      }
    }

    setIsCorrect(correct);
    setShowFeedback(true);
    setAnswers(prev => [...prev, {
      questionId: question.id,
      questionText: question.type === '변동분석'
        ? `[변동분석] ${question.question}`
        : question.question,
      explanation: question.explanation,
      studentAnswer,
      correctAnswer: question.type === '변동분석'
        ? (question.steps?.map(s => s.change).join(' → ') || question.answer)
        : question.answer,
      correct,
      unitCode: question.unitCode,
    }]);

    if (reviewMode) {
      updateReviewState(question.id, correct);
    }
  }, [question, selectedAnswer, blankAnswers, reviewMode]);

  const goNext = () => {
    if (currentIndex + 1 >= questions.length) {
      if (reviewMode) {
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
      if (hasResultPage) {
        router.push(`/units/${unitCode}/result`);
      } else {
        setQuizFinished(true);
      }
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
      const message = answers.length > 0
        ? `복습을 종료할까요?\n지금까지 맞힌 문제는 오답 노트에서 해결 처리되었습니다.`
        : '복습을 종료할까요?';
      if (confirm(message)) router.push('/review');
      return;
    }
    if (answers.length === 0) {
      if (confirm('퀴즈를 종료할까요?\n아직 푼 문제가 없어 기록이 저장되지 않습니다.')) {
        router.push(backHref);
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
      if (hasResultPage) {
        router.push(`/units/${unitCode}/result`);
      } else {
        setQuizFinished(true);
      }
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

  // 섞어풀기 등 별도 결과 페이지가 없는 퀴즈의 인라인 결과 화면
  if (quizFinished) {
    const correctCount = answers.filter(a => a.correct).length;
    const pct = Math.round((correctCount / answers.length) * 100);
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-surface rounded-2xl border border-border p-8">
          <h1 className="text-2xl font-bold mb-4">결과</h1>
          <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full text-3xl font-bold mb-4 ${
            pct >= 80 ? 'bg-success-light text-success' :
            pct >= 50 ? 'bg-warning-light text-warning' :
            'bg-error-light text-error'
          }`}>
            {pct}점
          </div>
          <p className="text-lg mb-1">
            <span className="font-bold">{answers.length}</span>문제 중{' '}
            <span className="font-bold text-success">{correctCount}</span>문제 정답
          </p>
          {answers.length - correctCount > 0 && (
            <p className="text-sm text-error mb-6">
              {answers.length - correctCount}문제 오답 — 오답 노트에 기록됨
            </p>
          )}
          <div className="flex gap-3 mt-6">
            <Link
              href={backHref}
              className="flex-1 py-3 text-center bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              돌아가기
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

  if (!question) return null;

  const canSubmit =
    question.type === '빈칸' || question.type === '변동분석'
      ? blankAnswers.length >= blankCount && blankAnswers.every(a => a.trim() !== '')
      : selectedAnswer.trim() !== '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={exitQuiz}
          className="text-sm text-text-secondary hover:text-primary"
        >
          &larr; 나가기
        </button>
        {!shuffleOnly && (
          <button
            onClick={toggleShuffle}
            disabled={!canShuffle}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              shuffled
                ? 'border-primary bg-primary-light text-primary'
                : 'border-border text-text-secondary hover:border-gray-300 dark:hover:border-white/20'
            } ${!canShuffle ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
            셔플 {shuffled ? 'ON' : 'OFF'}
          </button>
        )}
      </div>

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

        {question.type !== '변동분석' && (
          <p className="text-lg font-medium leading-relaxed mb-6">{question.question}</p>
        )}
        {question.type === '변동분석' && (
          <p className="text-base text-text-secondary mb-4">다음 단어의 음운 변동 과정을 분석하세요. 각 단계에 해당하는 변동 유형을 선택하세요.</p>
        )}

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

            {question.type === '변동분석' && question.steps && (
              <PhonemeChangeExercise
                word={question.question}
                steps={question.steps}
                value={blankAnswers}
                onChange={setBlankAnswers}
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
                  : question.type === '변동분석'
                    ? question.steps?.map(s => s.change).join(' → ')
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

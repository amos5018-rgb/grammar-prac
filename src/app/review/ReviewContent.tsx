'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getDedupedWrongAnswers, clearAllHistory, WrongAnswerRecord, getDueCount, getWrongCounts } from '@/lib/storage';
import { Question } from '@/lib/types';
import { units } from '@/data/units';
import { categories } from '@/data/categories';
import PhonemeChangeExercise from '@/components/PhonemeChangeExercise';

const unitNameMap: Record<string, string> = Object.fromEntries(units.map(u => [u.code, u.name]));
for (const c of categories) unitNameMap[`mixed-${c.code}`] = `${c.name} 섞어풀기`;

interface Props {
  allQuestions: Question[];
}

export default function ReviewContent({ allQuestions }: Props) {
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswerRecord[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [dueCount, setDueCount] = useState(0);
  const [wrongCounts, setWrongCounts] = useState<Record<string, number>>({});
  const [sortByCount, setSortByCount] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

  useEffect(() => {
    setWrongAnswers(getDedupedWrongAnswers());
    setDueCount(getDueCount());
    setWrongCounts(getWrongCounts());
  }, []);

  const handleReset = () => {
    if (!window.confirm('오답 노트와 학습 기록을 모두 초기화할까요?\n이 작업은 되돌릴 수 없습니다.')) return;
    clearAllHistory();
    setWrongAnswers([]);
    setFilter('all');
    setDueCount(0);
    setWrongCounts({});
  };

  const unitCodes = useMemo(() => [...new Set(wrongAnswers.map(w => w.unitCode))], [wrongAnswers]);

  const filtered = filter === 'all'
    ? wrongAnswers
    : wrongAnswers.filter(w => w.unitCode === filter);

  const sorted = useMemo(() => {
    if (sortByCount) {
      return [...filtered].sort((a, b) =>
        (wrongCounts[b.questionId] ?? 0) - (wrongCounts[a.questionId] ?? 0)
        || b.date.localeCompare(a.date)
      );
    }
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  }, [filtered, sortByCount, wrongCounts]);

  const questionMap = useMemo(() => {
    const m = new Map<string, Question>();
    for (const q of allQuestions) m.set(q.id, q);
    return m;
  }, [allQuestions]);

  const previewQuestion = previewId ? questionMap.get(previewId) : null;
  const previewWrong = previewId ? wrongAnswers.find(w => w.questionId === previewId) : null;

  // 문제 미리보기 오버레이
  if (previewQuestion && previewWrong) {
    return (
      <QuestionPreview
        question={previewQuestion}
        wrongAnswer={previewWrong}
        onClose={() => setPreviewId(null)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold">오답 노트</h1>
        {wrongAnswers.length > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-text-secondary hover:text-error border border-border hover:border-error/50 px-2.5 py-1 rounded-lg transition-colors"
          >
            기록 초기화
          </button>
        )}
      </div>
      <p className="text-text-secondary text-sm mb-6">틀린 문제를 다시 확인하세요</p>

      {/* 오늘의 복습 배너 */}
      {dueCount > 0 && (
        <Link
          href="/review/quiz?due=1"
          className="block w-full mb-4 py-4 text-center bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          오늘의 복습 {dueCount}문제
          <span className="block text-xs font-normal mt-0.5 opacity-80">
            간격 반복으로 장기 기억을 만들어요
          </span>
        </Link>
      )}

      {wrongAnswers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary mb-4">아직 오답 기록이 없습니다.</p>
          <Link href="/" className="text-primary font-medium">문제 풀러 가기</Link>
        </div>
      ) : (
        <>
          {/* 전체 틀린 문제 모아 풀기 */}
          <Link
            href={filter === 'all' ? '/review/quiz' : `/review/quiz?unit=${filter}`}
            className="block w-full mb-6 py-3 text-center bg-error text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
          >
            {filter === 'all'
              ? `전체 틀린 문제 모아 풀기 (${wrongAnswers.length}문제)`
              : `'${unitNameMap[filter] || filter}' 틀린 문제 모아 풀기 (${filtered.length}문제)`}
          </Link>

          {/* Filter + Sort */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <button
                onClick={() => setUnitDropdownOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-surface text-sm font-medium hover:border-primary/40 transition-colors"
              >
                <span>
                  {filter === 'all'
                    ? `전체 단원 (${wrongAnswers.length}문제)`
                    : `${unitNameMap[filter] || filter} (${filtered.length}문제)`}
                </span>
                <svg className={`w-4 h-4 text-text-secondary transition-transform ${unitDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {unitDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => { setFilter('all'); setUnitDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      filter === 'all' ? 'bg-primary-light text-primary font-semibold' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    전체 단원 ({wrongAnswers.length}문제)
                  </button>
                  {unitCodes.map(code => {
                    const count = wrongAnswers.filter(w => w.unitCode === code).length;
                    return (
                      <button
                        key={code}
                        onClick={() => { setFilter(code); setUnitDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          filter === code ? 'bg-primary-light text-primary font-semibold' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        {unitNameMap[code] || code} ({count}문제)
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mb-3">
            <button
              onClick={() => setSortByCount(prev => !prev)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                sortByCount
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border text-text-secondary hover:border-gray-300 dark:hover:border-white/20'
              }`}
            >
              {sortByCount ? '오답 횟수순' : '최근순'}
            </button>
          </div>

          {/* Wrong answers list */}
          <div className="space-y-3">
            {sorted.map((answer, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPreviewId(answer.questionId)}
                className="block w-full text-left bg-surface rounded-xl border border-border p-4 hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-error-light text-error px-2 py-0.5 rounded-full font-medium">
                    오답
                  </span>
                  {(wrongCounts[answer.questionId] ?? 0) >= 2 && (
                    <span className="text-xs bg-warning-light text-warning px-2 py-0.5 rounded-full font-medium">
                      {(wrongCounts[answer.questionId] ?? 0) > 5 ? '5+' : wrongCounts[answer.questionId]}회 오답
                    </span>
                  )}
                  <span className="text-xs text-text-secondary">{unitNameMap[answer.unitCode] || answer.unitCode}</span>
                  <span className="text-xs text-text-secondary">
                    {new Date(answer.date).toLocaleDateString('ko-KR')}
                  </span>
                  <svg className="w-4 h-4 text-text-secondary ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {answer.questionText && (
                  <p className="text-sm mb-3 leading-relaxed line-clamp-2">{answer.questionText}</p>
                )}
                <div className="flex gap-4 text-sm">
                  <p>
                    <span className="text-error font-medium">내 답:</span>{' '}
                    {answer.studentAnswer || '(미입력)'}
                  </p>
                  <p>
                    <span className="text-success font-medium">정답:</span>{' '}
                    {answer.correctAnswer}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Re-quiz button for filtered unit */}
          {filtered.length > 0 && filter !== 'all' && (
            <Link
              href={`/units/${filter}/quiz`}
              className="block w-full mt-6 py-3 text-center bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              이 단원 다시 풀기
            </Link>
          )}
        </>
      )}
    </div>
  );
}

// ── 문제 미리보기 오버레이 ──

function QuestionPreview({
  question,
  wrongAnswer,
  onClose,
}: {
  question: Question;
  wrongAnswer: WrongAnswerRecord;
  onClose: () => void;
}) {
  const studentSteps = question.type === '변동분석'
    ? wrongAnswer.studentAnswer.split(' → ')
    : [];
  const correctSteps = question.type === '변동분석'
    ? (question.steps?.map(s => s.change) ?? [])
    : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <button
        onClick={onClose}
        className="text-sm text-text-secondary hover:text-primary mb-4"
      >
        &larr; 오답 노트로
      </button>

      {/* Question card */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block text-xs font-medium text-primary bg-primary-light px-2.5 py-1 rounded-full">
            {question.type === 'ox' ? 'O/X' : question.type}
          </span>
          <span className="text-xs text-text-secondary">{unitNameMap[question.unitCode] || question.unitCode}</span>
        </div>

        {question.passage && (
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-4 text-sm leading-relaxed border border-gray-100 dark:border-white/10 whitespace-pre-line">
            {question.passage}
          </div>
        )}

        {question.type !== '변동분석' && (
          <p className="text-lg font-medium leading-relaxed mb-6">{question.question}</p>
        )}
        {question.type === '변동분석' && (
          <p className="text-base text-text-secondary mb-4">다음 단어의 음운 변동 과정을 분석하세요.</p>
        )}

        {/* 객관식: 선택지 표시 */}
        {question.type === '객관식' && (
          <div className="space-y-3 mb-4">
            {question.choices.map((choice, idx) => {
              const num = String(idx + 1);
              const isCorrect = num === question.answer;
              const isStudent = num === wrongAnswer.studentAnswer;
              return (
                <div
                  key={idx}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 text-base ${
                    isCorrect
                      ? 'border-success bg-success-light'
                      : isStudent
                        ? 'border-error bg-error-light'
                        : 'border-border'
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mr-3 ${
                    isCorrect
                      ? 'bg-success text-white'
                      : isStudent
                        ? 'bg-error text-white'
                        : 'bg-gray-100 dark:bg-white/10'
                  }`}>
                    {idx + 1}
                  </span>
                  {choice}
                  {isCorrect && <span className="ml-2 text-success text-sm font-medium">정답</span>}
                  {isStudent && !isCorrect && <span className="ml-2 text-error text-sm font-medium">내 답</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* OX: O/X 표시 */}
        {question.type === 'ox' && (
          <div className="flex gap-4 mb-4">
            {['O', 'X'].map(val => {
              const isCorrect = val.toUpperCase() === question.answer.toUpperCase();
              const isStudent = val.toUpperCase() === wrongAnswer.studentAnswer.toUpperCase();
              return (
                <div
                  key={val}
                  className={`flex-1 py-6 rounded-xl border-2 text-3xl font-bold text-center ${
                    isCorrect
                      ? 'border-success bg-success-light text-success'
                      : isStudent
                        ? 'border-error bg-error-light text-error'
                        : 'border-border text-text-secondary'
                  }`}
                >
                  {val}
                  {isCorrect && <p className="text-xs font-medium mt-1">정답</p>}
                  {isStudent && !isCorrect && <p className="text-xs font-medium mt-1">내 답</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* 빈칸: 정답 표시 */}
        {question.type === '빈칸' && (
          <div className="space-y-3 mb-4">
            {question.answer.split('/').map((part, idx) => (
              <div key={idx} className="px-4 py-3 rounded-xl border-2 border-success bg-success-light text-base">
                <span className="text-xs text-success font-medium mr-2">빈칸 {idx + 1} 정답:</span>
                {part.trim()}
              </div>
            ))}
          </div>
        )}

        {/* 단답형: 정답 표시 */}
        {question.type === '단답형' && (
          <div className="px-4 py-3 rounded-xl border-2 border-success bg-success-light text-base mb-4">
            <span className="text-xs text-success font-medium mr-2">정답:</span>
            {question.answer.split('|').join(' 또는 ')}
          </div>
        )}

        {/* 변동분석: 단계별 표시 */}
        {question.type === '변동분석' && question.steps && (
          <div className="mb-4">
            <PhonemeChangeExercise
              word={question.question}
              steps={question.steps}
              value={correctSteps}
              onChange={() => {}}
              disabled
            />
          </div>
        )}

        {/* 오답 정보 */}
        <div className="rounded-xl p-5 bg-error-light">
          <p className="font-bold text-lg mb-3 text-error">틀렸습니다</p>

          {question.type === '변동분석' && studentSteps.length > 0 ? (
            <div className="space-y-1.5 mb-3">
              {studentSteps.map((step, idx) => {
                const isWrong = step !== correctSteps[idx];
                return (
                  <p key={idx} className="text-sm">
                    <span className="font-medium">단계 {idx + 1}:</span>{' '}
                    <span className={isWrong ? 'text-error font-medium' : 'text-success'}>
                      {step || '(미입력)'}
                    </span>
                    {isWrong && correctSteps[idx] && (
                      <span className="text-success ml-2">
                        → {correctSteps[idx]}
                      </span>
                    )}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="flex gap-4 text-sm mb-3">
              <p>
                <span className="text-error font-medium">내 답:</span>{' '}
                {wrongAnswer.studentAnswer || '(미입력)'}
              </p>
              {question.type !== '객관식' && question.type !== 'ox' && (
                <p>
                  <span className="text-success font-medium">정답:</span>{' '}
                  {wrongAnswer.correctAnswer}
                </p>
              )}
            </div>
          )}

          <p className="text-sm leading-relaxed text-text">{question.explanation}</p>
        </div>
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors"
      >
        오답 노트로 돌아가기
      </button>
    </div>
  );
}

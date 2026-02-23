'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getAllWrongAnswers, clearAllHistory } from '@/lib/storage';
import { AnswerRecord } from '@/lib/types';

type WrongAnswer = AnswerRecord & { unitCode: string; date: string };

function deduplicateByQuestion(items: WrongAnswer[]): WrongAnswer[] {
  return items.reduce<WrongAnswer[]>((acc, curr) => {
    const existing = acc.findIndex(a => a.questionId === curr.questionId);
    if (existing >= 0) {
      if (curr.date > acc[existing].date) acc[existing] = curr;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);
}

export default function ReviewPage() {
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setWrongAnswers(getAllWrongAnswers());
  }, []);

  const handleReset = () => {
    if (!window.confirm('오답 노트와 학습 기록을 모두 초기화할까요?\n이 작업은 되돌릴 수 없습니다.')) return;
    clearAllHistory();
    setWrongAnswers([]);
    setFilter('all');
  };

  const allDeduplicated = useMemo(() => deduplicateByQuestion(wrongAnswers), [wrongAnswers]);

  const unitCodes = [...new Set(allDeduplicated.map(w => w.unitCode))];

  const filtered = filter === 'all'
    ? allDeduplicated
    : allDeduplicated.filter(w => w.unitCode === filter);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold">오답 노트</h1>
        {allDeduplicated.length > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-text-secondary hover:text-error border border-border hover:border-error/50 px-2.5 py-1 rounded-lg transition-colors"
          >
            기록 초기화
          </button>
        )}
      </div>
      <p className="text-text-secondary text-sm mb-6">틀린 문제를 다시 확인하세요</p>

      {allDeduplicated.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary mb-4">아직 오답 기록이 없습니다.</p>
          <Link href="/" className="text-primary font-medium">문제 풀러 가기</Link>
        </div>
      ) : (
        <>
          {/* Filter */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              전체 ({allDeduplicated.length})
            </button>
            {unitCodes.map(code => {
              const count = allDeduplicated.filter(w => w.unitCode === code).length;
              return (
                <button
                  key={code}
                  onClick={() => setFilter(code)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filter === code ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {code} ({count})
                </button>
              );
            })}
          </div>

          {/* Wrong answers list */}
          <div className="space-y-3">
            {filtered.map((answer, idx) => (
              <div key={idx} className="bg-surface rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-error-light text-error px-2 py-0.5 rounded-full font-medium">
                    오답
                  </span>
                  <span className="text-xs text-text-secondary">{answer.unitCode}</span>
                  <span className="text-xs text-text-secondary">
                    {new Date(answer.date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                {answer.questionText && (
                  <p className="text-sm mb-3 leading-relaxed">{answer.questionText}</p>
                )}
                <div className="flex gap-4 text-sm mb-2">
                  <p>
                    <span className="text-error font-medium">내 답:</span>{' '}
                    {answer.studentAnswer || '(미입력)'}
                  </p>
                  <p>
                    <span className="text-success font-medium">정답:</span>{' '}
                    {answer.correctAnswer}
                  </p>
                </div>
                {answer.explanation && (
                  <p className="text-xs text-text-secondary leading-relaxed">{answer.explanation}</p>
                )}
              </div>
            ))}
          </div>

          {/* Re-quiz button */}
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

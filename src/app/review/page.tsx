'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllWrongAnswers } from '@/lib/storage';
import { AnswerRecord } from '@/lib/types';

type WrongAnswer = AnswerRecord & { unitCode: string; date: string };

export default function ReviewPage() {
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setWrongAnswers(getAllWrongAnswers());
  }, []);

  const unitCodes = [...new Set(wrongAnswers.map(w => w.unitCode))];
  const filtered = filter === 'all'
    ? wrongAnswers
    : wrongAnswers.filter(w => w.unitCode === filter);

  // Deduplicate by questionId (show latest attempt only)
  const deduplicated = filtered.reduce<WrongAnswer[]>((acc, curr) => {
    const existing = acc.findIndex(a => a.questionId === curr.questionId);
    if (existing >= 0) {
      if (curr.date > acc[existing].date) acc[existing] = curr;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">오답 노트</h1>
      <p className="text-text-secondary text-sm mb-6">틀린 문제를 다시 확인하세요</p>

      {wrongAnswers.length === 0 ? (
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
              전체 ({wrongAnswers.length})
            </button>
            {unitCodes.map(code => {
              const count = wrongAnswers.filter(w => w.unitCode === code).length;
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
            {deduplicated.map((answer, idx) => (
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
                <p className="text-sm mb-2">
                  <span className="text-text-secondary">문제 ID:</span> {answer.questionId}
                </p>
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
              </div>
            ))}
          </div>

          {/* Re-quiz button */}
          {deduplicated.length > 0 && filter !== 'all' && (
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

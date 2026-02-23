'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { QuizAttempt } from '@/lib/types';
import { getLastQuizResult } from '@/lib/storage';

export default function ResultPage() {
  const params = useParams();
  const code = params.code as string;
  const [result, setResult] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    const last = getLastQuizResult();
    if (last && last.unitCode === code) setResult(last);
  }, [code]);

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary mb-4">결과를 찾을 수 없습니다.</p>
        <Link href="/" className="text-primary font-medium">단원 목록으로</Link>
      </div>
    );
  }

  const pct = Math.round((result.score / result.total) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-surface rounded-2xl border border-border p-6 text-center mb-6">
        <h1 className="text-2xl font-bold mb-4">결과</h1>

        <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full text-3xl font-bold mb-4 ${
          pct >= 80 ? 'bg-success-light text-success' :
          pct >= 50 ? 'bg-warning-light text-warning' :
          'bg-error-light text-error'
        }`}>
          {pct}점
        </div>

        <p className="text-lg mb-1">
          <span className="font-bold">{result.total}</span>문제 중{' '}
          <span className="font-bold text-success">{result.score}</span>문제 정답
        </p>
        <p className="text-text-secondary text-sm">
          {result.total - result.score > 0 && (
            <span className="text-error">{result.total - result.score}문제 오답</span>
          )}
        </p>
      </div>

      {/* Answer breakdown */}
      <div className="space-y-3 mb-8">
        {result.answers.map((answer, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-4 ${
              answer.correct ? 'border-success/30 bg-success-light/50' : 'border-error/30 bg-error-light/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-bold ${answer.correct ? 'text-success' : 'text-error'}`}>
                {answer.correct ? 'O' : 'X'}
              </span>
              <span className="text-sm text-text-secondary">문제 {idx + 1}</span>
            </div>
            {answer.questionText && (
              <p className="text-sm mb-2 leading-relaxed">{answer.questionText}</p>
            )}
            {!answer.correct && (
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-error font-medium">내 답:</span> {answer.studentAnswer || '(미입력)'}
                  <span className="text-text-secondary mx-2">|</span>
                  <span className="text-success font-medium">정답:</span> {answer.correctAnswer}
                </p>
                {answer.explanation && (
                  <p className="text-text-secondary leading-relaxed">{answer.explanation}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href={`/units/${code}/quiz`}
          className="flex-1 py-3 text-center bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          다시 풀기
        </Link>
        <Link
          href="/"
          className="flex-1 py-3 text-center border border-border rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          단원 목록
        </Link>
      </div>
    </div>
  );
}

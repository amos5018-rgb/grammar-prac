'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { QuizAttempt } from '@/lib/types';
import {
  getLastQuizResult,
  getQuizResults,
  getCorrectQuestionIds,
  tierFromResults,
  UnitTier,
} from '@/lib/storage';
import { getUnitQuestionIds } from '@/data/questions/coverage';
import { units } from '@/data/units';

const RANK: Record<string, number> = { beginner: 0, challenger: 1, trainee: 2, skilled: 3, master: 4 };

interface ResultExtra {
  tierAfter: UnitTier;
  promoted: boolean;
  coveredBefore: number;
  coveredAfter: number;
  total: number;
  showConversion: boolean;
}

export default function ResultContent({ code }: { code: string }) {
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [extra, setExtra] = useState<ResultExtra | null>(null);

  useEffect(() => {
    const last = getLastQuizResult();
    if (!last || last.unitCode !== code) return;
    setResult(last);

    const all = getQuizResults();
    const before = all.filter(r => r.attemptId !== last.attemptId);
    const unit = units.find(u => u.code === code);
    const ids = unit ? getUnitQuestionIds(unit) : [];

    const tierAfter = tierFromResults(all, code, ids.length);
    const tierBefore = tierFromResults(before, code, ids.length);
    const promoted = RANK[tierAfter.level] > RANK[tierBefore.level];

    const correctAfter = getCorrectQuestionIds(all);
    const correctBefore = getCorrectQuestionIds(before);
    const coveredAfter = ids.filter(id => correctAfter.has(id)).length;
    const coveredBefore = ids.filter(id => correctBefore.has(id)).length;

    const showConversion =
      last.full === false &&
      tierAfter.level === 'skilled' &&
      !tierAfter.mastered;

    setExtra({ tierAfter, promoted, coveredBefore, coveredAfter, total: ids.length, showConversion });
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
        <h1 className="text-2xl font-bold mb-2">결과</h1>
        {result.completed === false && (
          <p className="inline-block text-xs bg-warning-light text-warning px-2.5 py-1 rounded-full font-medium mb-3">
            중간 종료 — {result.total}문제까지 풀이
          </p>
        )}

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

        {extra?.promoted && (
          <p className="mt-4 inline-block bg-primary-light text-primary font-bold px-4 py-2 rounded-xl">
            &#127881; {extra.tierAfter.emoji} {extra.tierAfter.label} 달성!
          </p>
        )}

        {extra && extra.total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-text">정복도</span>
              <span className="text-sm font-semibold text-success">
                {extra.coveredAfter > extra.coveredBefore
                  ? `정복 ${extra.coveredBefore} → ${extra.coveredAfter}/${extra.total}`
                  : `정복 ${extra.coveredAfter}/${extra.total}`}
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${Math.round((extra.coveredAfter / extra.total) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {extra?.showConversion && (
        <Link
          href={`/units/${code}/quiz`}
          className="block w-full mb-6 py-4 text-center bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          &#128293; 전부 풀기로 마스터 도전 &rarr;
        </Link>
      )}

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

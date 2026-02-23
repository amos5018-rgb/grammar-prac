'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQuizResults, getUnitProgress, clearAllHistory } from '@/lib/storage';
import { QuizAttempt } from '@/lib/types';

export default function ProgressPage() {
  const [progress, setProgress] = useState<Record<string, { attempts: number; bestScore: number | null }>>({});
  const [results, setResults] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    setProgress(getUnitProgress());
    setResults(getQuizResults());
  }, []);

  const handleReset = () => {
    if (!window.confirm('오답 노트와 학습 기록을 모두 초기화할까요?\n이 작업은 되돌릴 수 없습니다.')) return;
    clearAllHistory();
    setProgress({});
    setResults([]);
  };

  const unitCodes = Object.keys(progress);
  const totalAttempts = results.length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / results.length)
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold">학습 진도</h1>
        {totalAttempts > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-text-secondary hover:text-error border border-border hover:border-error/50 px-2.5 py-1 rounded-lg transition-colors"
          >
            기록 초기화
          </button>
        )}
      </div>
      <p className="text-text-secondary text-sm mb-6">전체 학습 현황을 확인하세요</p>

      {totalAttempts === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary mb-4">아직 학습 기록이 없습니다.</p>
          <Link href="/" className="text-primary font-medium">문제 풀러 가기</Link>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-surface rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{unitCodes.length}</p>
              <p className="text-xs text-text-secondary mt-1">학습한 단원</p>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{totalAttempts}</p>
              <p className="text-xs text-text-secondary mt-1">총 풀이 횟수</p>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4 text-center">
              <p className={`text-2xl font-bold ${
                avgScore >= 80 ? 'text-success' :
                avgScore >= 50 ? 'text-warning' : 'text-error'
              }`}>{avgScore}%</p>
              <p className="text-xs text-text-secondary mt-1">평균 점수</p>
            </div>
          </div>

          {/* Per-unit progress */}
          <h2 className="font-bold text-lg mb-4">단원별 현황</h2>
          <div className="space-y-3">
            {unitCodes.map(code => {
              const data = progress[code];
              const score = data.bestScore ?? 0;
              return (
                <div key={code} className="bg-surface rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{code}</span>
                    <span className="text-sm text-text-secondary">{data.attempts}회 풀이</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          score >= 80 ? 'bg-success' :
                          score >= 50 ? 'bg-warning' : 'bg-error'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold min-w-[3rem] text-right ${
                      score >= 80 ? 'text-success' :
                      score >= 50 ? 'text-warning' : 'text-error'
                    }`}>
                      {score}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent attempts */}
          <h2 className="font-bold text-lg mt-8 mb-4">최근 풀이 기록</h2>
          <div className="space-y-2">
            {[...results].reverse().slice(0, 10).map((result, idx) => (
              <div key={idx} className="flex items-center justify-between bg-surface rounded-xl border border-border px-4 py-3">
                <div>
                  <span className="font-medium text-sm">{result.unitCode}</span>
                  <span className="text-xs text-text-secondary ml-2">
                    {new Date(result.date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <span className={`font-bold text-sm ${
                  (result.score / result.total) >= 0.8 ? 'text-success' :
                  (result.score / result.total) >= 0.5 ? 'text-warning' : 'text-error'
                }`}>
                  {result.score}/{result.total}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

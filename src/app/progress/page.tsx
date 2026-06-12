'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQuizResults, getUnitProgress, clearAllHistory, getUnitMastery, getStreak, getRecentWeekDates } from '@/lib/storage';
import { QuizAttempt } from '@/lib/types';
import { units } from '@/data/units';

const unitNameMap = Object.fromEntries(units.map(u => [u.code, u.name]));
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function ProgressPage() {
  const [progress, setProgress] = useState<Record<string, { attempts: number; bestScore: number | null }>>({});
  const [results, setResults] = useState<QuizAttempt[]>([]);
  const [masteryMap, setMasteryMap] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [weekDates, setWeekDates] = useState<{ date: string; active: boolean }[]>([]);

  useEffect(() => {
    setProgress(getUnitProgress());
    setResults(getQuizResults());
    setStreak(getStreak());
    setWeekDates(getRecentWeekDates());
    const m: Record<string, boolean> = {};
    for (const u of units) {
      m[u.code] = getUnitMastery(u.code).mastered;
    }
    setMasteryMap(m);
  }, []);

  const handleReset = () => {
    if (!window.confirm('오답 노트와 학습 기록을 모두 초기화할까요?\n이 작업은 되돌릴 수 없습니다.')) return;
    clearAllHistory();
    setProgress({});
    setResults([]);
    setMasteryMap({});
    setStreak(0);
    setWeekDates([]);
  };

  const unitCodes = Object.keys(progress);
  const totalAttempts = results.length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / results.length)
    : 0;
  const masteredCount = Object.values(masteryMap).filter(Boolean).length;

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
          {/* 학습 스트릭 + 주간 캘린더 */}
          <div className="bg-surface rounded-xl border border-border p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">&#128293;</span>
              <span className="font-bold">
                {streak > 0 ? `${streak}일 연속 학습 중!` : '오늘 학습을 시작해 보세요!'}
              </span>
            </div>
            <div className="flex justify-between gap-1">
              {weekDates.map(({ date, active }) => {
                const dayIdx = new Date(date + 'T00:00:00').getDay();
                return (
                  <div key={date} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs text-text-secondary">{DAY_LABELS[dayIdx]}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      active
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-white/10 text-text-secondary'
                    }`}>
                      {parseInt(date.split('-')[2])}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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

          {masteredCount > 0 && (
            <p className="text-sm text-text-secondary mb-4">
              &#128081; {masteredCount}개 단원 마스터 달성
            </p>
          )}

          {/* Per-unit progress */}
          <h2 className="font-bold text-lg mb-4">단원별 현황</h2>
          <div className="space-y-3">
            {unitCodes.map(code => {
              const data = progress[code];
              const score = data.bestScore ?? 0;
              return (
                <div key={code} className="bg-surface rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{unitNameMap[code] || code}</span>
                      {masteryMap[code] && <span title="마스터">&#128081;</span>}
                    </div>
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
                  <span className="font-medium text-sm">{unitNameMap[result.unitCode] || result.unitCode}</span>
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

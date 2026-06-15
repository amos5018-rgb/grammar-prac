'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQuizResults, getUnitProgress, getUnitTierMap, getCorrectQuestionIds, clearAllHistory, getStreak, getExamCalendar, getDday, UnitTier, TierLevel } from '@/lib/storage';
import { getUnitQuestionIds } from '@/data/questions/coverage';
import { QuizAttempt } from '@/lib/types';
import { units } from '@/data/units';
import { categories } from '@/data/categories';

const unitNameMap: Record<string, string> = Object.fromEntries(units.map(u => [u.code, u.name]));
for (const c of categories) unitNameMap[`mixed-${c.code}`] = `${c.name} 섞어풀기`;
const TIER_RANK: Record<TierLevel, number> = { beginner: 0, challenger: 1, trainee: 2, skilled: 3, master: 4 };
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function ProgressPage() {
  const [progress, setProgress] = useState<Record<string, { attempts: number; bestScore: number | null }>>({});
  const [results, setResults] = useState<QuizAttempt[]>([]);
  const [masteredCount, setMasteredCount] = useState(0);
  const [tierMap, setTierMap] = useState<Record<string, UnitTier>>({});
  const [coveredMap, setCoveredMap] = useState<Record<string, number>>({});
  const [totalMap, setTotalMap] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [calendar, setCalendar] = useState<{ date: string; active: boolean; isToday: boolean; isExam: boolean; isPast: boolean }[]>([]);
  const [dday, setDday] = useState(0);

  useEffect(() => {
    const allResults = getQuizResults();
    setResults(allResults);
    setStreak(getStreak());
    setCalendar(getExamCalendar());
    setDday(getDday());

    setProgress(getUnitProgress());

    const tiers = getUnitTierMap();
    setTierMap(tiers);
    setMasteredCount(Object.values(tiers).filter(t => t.mastered).length);

    // 진행도: 단원별 한 번이라도 맞힌 문항 수
    const correct = getCorrectQuestionIds(allResults);
    const cov: Record<string, number> = {};
    const tot: Record<string, number> = {};
    for (const u of units) {
      if (u.study) continue;
      const ids = getUnitQuestionIds(u);
      if (ids.length === 0) continue;
      cov[u.code] = ids.filter(id => correct.has(id)).length;
      tot[u.code] = ids.length;
    }
    setCoveredMap(cov);
    setTotalMap(tot);
  }, []);

  const handleReset = () => {
    if (!window.confirm('오답 노트와 학습 기록을 모두 초기화할까요?\n이 작업은 되돌릴 수 없습니다.')) return;
    clearAllHistory();
    setProgress({});
    setResults([]);
    setMasteredCount(0);
    setTierMap({});
    setCoveredMap({});
    setTotalMap({});
    setStreak(0);
    setCalendar(getExamCalendar());
  };

  const unitCodes = Object.keys(progress).sort((a, b) => {
    const ra = TIER_RANK[tierMap[a]?.level ?? 'beginner'];
    const rb = TIER_RANK[tierMap[b]?.level ?? 'beginner'];
    return rb - ra;
  });
  const totalAttempts = results.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold">학습 기록</h1>
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
          {/* 기말고사 D-day 캘린더 */}
          <div className="bg-surface rounded-xl border border-border p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">&#128293;</span>
                <span className="font-bold">
                  {streak > 0 ? `${streak}일 연속 학습 중!` : '오늘 학습을 시작해 보세요!'}
                </span>
              </div>
              {dday > 0 && (
                <span className="text-sm font-bold text-success">
                  D-{dday}
                </span>
              )}
              {dday === 0 && (
                <span className="text-sm font-bold text-success">D-Day</span>
              )}
            </div>

            {calendar.length > 0 && (
              <>
                <div className="grid grid-cols-6 gap-1.5 mb-1.5">
                  {calendar.slice(0, 6).map(({ date }) => {
                    const dayIdx = new Date(date + 'T00:00:00').getDay();
                    return (
                      <div key={date + '-label'} className="text-center">
                        <span className="text-[10px] text-text-secondary">{DAY_LABELS[dayIdx]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-6 gap-1.5 mb-2">
                  {calendar.slice(0, 6).map(day => (
                    <CalendarCell key={day.date} {...day} />
                  ))}
                </div>
                <div className="grid grid-cols-6 gap-1.5 mb-1.5">
                  {calendar.slice(6).map(({ date }) => {
                    const dayIdx = new Date(date + 'T00:00:00').getDay();
                    return (
                      <div key={date + '-label'} className="text-center">
                        <span className="text-[10px] text-text-secondary">{DAY_LABELS[dayIdx]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {calendar.slice(6).map(day => (
                    <CalendarCell key={day.date} {...day} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Per-unit progress */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="font-bold text-lg">단원별 현황</h2>
            {masteredCount > 0 && (
              <span className="bg-warning-light text-warning px-2.5 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                &#128081; {masteredCount}개 마스터
              </span>
            )}
          </div>
          <div className="space-y-2">
            {unitCodes.map(code => {
              const data = progress[code];
              const score = data.bestScore ?? 0;
              const covered = coveredMap[code] ?? 0;
              const total = totalMap[code];
              const covPct = total ? Math.round((covered / total) * 100) : 0;
              return (
                <div key={code} className="bg-surface rounded-xl border border-border px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {tierMap[code] && (
                        <span className="shrink-0" title={tierMap[code].label}>{tierMap[code].emoji}</span>
                      )}
                      <span className="font-medium truncate">{unitNameMap[code] || code}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-sm">
                      <span className="text-text-secondary">{data.attempts}회</span>
                      <span className={`font-bold ${
                        score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-error'
                      }`}>{score}%</span>
                      {total !== undefined && (
                        <span className="text-success font-medium">{covered}/{total}</span>
                      )}
                    </div>
                  </div>
                  {total !== undefined && (
                    <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all"
                        style={{ width: `${covPct}%` }}
                      />
                    </div>
                  )}
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

function CalendarCell({ date, active, isToday, isExam, isPast }: {
  date: string; active: boolean; isToday: boolean; isExam: boolean; isPast: boolean;
}) {
  const day = parseInt(date.split('-')[2]);
  let className = 'w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium relative ';
  if (isExam) {
    className += active
      ? 'bg-success text-white ring-2 ring-success ring-offset-1'
      : 'bg-success/10 text-success ring-2 ring-success/50 ring-offset-1';
  } else if (active) {
    className += 'bg-primary text-white';
  } else if (isToday) {
    className += 'bg-primary/10 text-primary ring-2 ring-primary ring-offset-1';
  } else if (isPast) {
    className += 'bg-gray-100 dark:bg-white/10 text-text-secondary/50';
  } else {
    className += 'bg-gray-100 dark:bg-white/10 text-text-secondary';
  }
  return (
    <div className={className}>
      {day}
      {isExam && <span className="absolute -top-4 -right-2 text-[24px]">&#127808;</span>}
    </div>
  );
}

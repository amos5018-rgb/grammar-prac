'use client';

import { useEffect, useState } from 'react';
import { UNIT_NAMES } from '@/data/unitNames';

interface StudentDetail {
  profile: {
    name: string;
    studentId: string;
    streak: number;
    activityDates: string[];
    unitTiers: Record<string, { level: string; label: string; mastered: boolean; bestScore: number | null }>;
    unitProgress: Record<string, { attempts: number; bestScore: number | null }>;
  };
  recentAttempts: Array<{ attemptId: string; unitCode: string; date: string; correct: number; total: number }>;
  unitCorrectRates: Record<string, { correct: number; total: number; rate: number }>;
}

interface Props {
  clientId: string | null;
  onClose: () => void;
}

const TIER_EMOJI: Record<string, string> = {
  master: '👑',
  skilled: '💪',
  trainee: '🔥',
  challenger: '⭐',
  beginner: '🌱',
};

export default function StudentDetailDrawer({ clientId, onClose }: Props) {
  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!clientId) { setData(null); return; }
    setLoading(true);
    setError('');
    fetch(`/api/teacher/student?clientId=${clientId}`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setData)
      .catch(() => setError('데이터를 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (!clientId) return null;

  // Overall correct rate from unitCorrectRates
  let totalCorrect = 0;
  let totalAnswered = 0;
  if (data) {
    for (const v of Object.values(data.unitCorrectRates)) {
      totalCorrect += v.correct;
      totalAnswered += v.total;
    }
  }
  const overallRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 1000) / 10 : null;

  // Weak units (lowest 3 rates with total >= 3)
  const weakUnits = data
    ? Object.entries(data.unitCorrectRates)
        .filter(([, v]) => v.total >= 3)
        .sort(([, a], [, b]) => a.rate - b.rate)
        .slice(0, 3)
    : [];

  // Activity calendar (last 30 days)
  const today = new Date();
  const calendarDays: Array<{ date: string; active: boolean }> = [];
  if (data) {
    const actSet = new Set(data.profile.activityDates);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      calendarDays.push({ date: ds, active: actSet.has(ds) });
    }
  }

  // Unit tiers sorted
  const unitTierEntries = data
    ? Object.entries(data.profile.unitTiers)
        .filter(([code]) => UNIT_NAMES[code])
        .sort(([a], [b]) => (UNIT_NAMES[a] ?? a).localeCompare(UNIT_NAMES[b] ?? b))
    : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-surface border-l border-border z-50 overflow-y-auto shadow-[var(--shadow-lg)] animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-surface/90 backdrop-blur-sm border-b border-border/70 px-4 py-3 flex items-center justify-between z-10">
          <h2 className="font-bold text-text">학생 상세</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-background transition-colors"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-text-secondary">불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="p-4">
            <p className="text-sm text-error text-center">{error}</p>
          </div>
        )}

        {data && (
          <div className="p-4 space-y-5">
            {/* Profile */}
            <div className="text-center">
              <p className="text-lg font-bold text-text">{data.profile.name}</p>
              <p className="text-sm text-text-secondary">{data.profile.studentId}</p>
              <div className="flex justify-center gap-4 mt-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary tabular-nums">{data.profile.streak}</p>
                  <p className="text-xs text-text-secondary">스트릭</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-warning tabular-nums">
                    {Object.values(data.profile.unitTiers).filter(t => t.mastered).length}
                  </p>
                  <p className="text-xs text-text-secondary">마스터</p>
                </div>
                <div className="text-center">
                  <p className={`text-xl font-bold tabular-nums ${
                    overallRate === null ? 'text-text-secondary' :
                    overallRate < 50 ? 'text-error' :
                    overallRate < 70 ? 'text-warning' : 'text-success'
                  }`}>
                    {overallRate !== null ? `${overallRate}%` : '-'}
                  </p>
                  <p className="text-xs text-text-secondary">정답률</p>
                </div>
              </div>
            </div>

            {/* Activity Calendar */}
            {calendarDays.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-text mb-2">최근 30일 활동</h3>
                <div className="grid grid-cols-10 gap-1">
                  {calendarDays.map(d => (
                    <div
                      key={d.date}
                      title={d.date}
                      className={`aspect-square rounded-sm ${
                        d.active ? 'bg-primary' : 'bg-background border border-border/50'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {calendarDays.filter(d => d.active).length}일 활동
                </p>
              </div>
            )}

            {/* Weak Units */}
            {weakUnits.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-text mb-2">약점 단원</h3>
                <div className="space-y-2">
                  {weakUnits.map(([code, v]) => (
                    <div key={code} className="bg-error-light rounded-xl px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-text truncate">{UNIT_NAMES[code] ?? code}</p>
                        <span className="text-sm font-bold text-error tabular-nums shrink-0 ml-2">{v.rate}%</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{v.correct}/{v.total} 정답</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unit Tiers */}
            {unitTierEntries.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-text mb-2">단원별 성취</h3>
                <div className="bg-background rounded-xl overflow-hidden divide-y divide-border/50">
                  {unitTierEntries.map(([code, tier]) => {
                    const progress = data.profile.unitProgress[code];
                    const rate = data.unitCorrectRates[code];
                    return (
                      <div key={code} className="px-3 py-2 flex items-center gap-2">
                        <span className="text-base shrink-0">{TIER_EMOJI[tier.level] ?? '🌱'}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-text truncate">{UNIT_NAMES[code] ?? code}</p>
                          <p className="text-xs text-text-secondary">
                            {tier.label}
                            {progress && ` · ${progress.attempts}회`}
                            {tier.bestScore !== null && ` · 최고 ${tier.bestScore}점`}
                          </p>
                        </div>
                        {rate && (
                          <span className={`text-xs font-bold tabular-nums shrink-0 ${
                            rate.rate < 50 ? 'text-error' : rate.rate < 70 ? 'text-warning' : 'text-success'
                          }`}>
                            {rate.rate}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Attempts */}
            {data.recentAttempts.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-text mb-2">최근 시도</h3>
                <div className="bg-background rounded-xl overflow-hidden divide-y divide-border/50">
                  {data.recentAttempts.map(a => {
                    const pct = a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0;
                    return (
                      <div key={a.attemptId} className="px-3 py-2 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-text truncate">{UNIT_NAMES[a.unitCode] ?? a.unitCode}</p>
                          <p className="text-xs text-text-secondary">{a.date.slice(0, 10)}</p>
                        </div>
                        <span className={`text-xs font-bold tabular-nums shrink-0 ${
                          pct < 50 ? 'text-error' : pct < 70 ? 'text-warning' : 'text-success'
                        }`}>
                          {a.correct}/{a.total} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

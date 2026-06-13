'use client';

import { useEffect, useState } from 'react';
import UnitRatesTable from './UnitRatesTable';
import HardestQuestions from './HardestQuestions';
import MasteryGrid from './MasteryGrid';
import StreakOverview from './StreakOverview';

type Tab = 'units' | 'questions' | 'mastery' | 'streaks';

const TABS: { key: Tab; label: string }[] = [
  { key: 'units', label: '단원 정답률' },
  { key: 'questions', label: '어려운 문항' },
  { key: 'mastery', label: '마스터 현황' },
  { key: 'streaks', label: '스트릭' },
];

interface Stats {
  totalStudents: number;
  activeToday: number;
  unitRates: Array<{ unit_code: string; total_answers: number; correct_answers: number; correct_rate: number }>;
  questionRates: Array<{ question_id: string; unit_code: string; question_text: string; attempts: number; correct_count: number; correct_rate: number }>;
  masteryByUnit: Record<string, number>;
  roster: Array<{ clientId: string; name: string; studentId: string; streak: number; masteredCount: number; lastSyncedAt: string }>;
}

export default function TeacherDashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('units');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/teacher/stats');
      if (!res.ok) throw new Error('failed');
      setStats(await res.json());
      setError('');
    } catch {
      setError('데이터를 불러올 수 없습니다.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleLogout = async () => {
    await fetch('/api/teacher/logout', { method: 'POST' });
    onLogout();
  };

  if (!stats && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">데이터 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="h-12 flex items-center justify-between">
            <h1 className="font-bold text-primary text-lg">교사 대시보드</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchStats}
                disabled={refreshing}
                className="text-sm text-text-secondary hover:text-text transition-colors disabled:opacity-50"
              >
                {refreshing ? '갱신 중...' : '새로고침'}
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-error hover:underline"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {error && (
          <div className="bg-error-light text-error text-sm rounded-xl p-3 text-center">{error}</div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-2xl border border-border p-4 text-center">
                <p className="text-3xl font-bold text-text">{stats.totalStudents}</p>
                <p className="text-xs text-text-secondary mt-1">등록 학생 수</p>
              </div>
              <div className="bg-surface rounded-2xl border border-border p-4 text-center">
                <p className="text-3xl font-bold text-primary">{stats.activeToday}</p>
                <p className="text-xs text-text-secondary mt-1">오늘 활동</p>
              </div>
            </div>

            <div className="flex gap-1 bg-surface rounded-xl border border-border p-1">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    tab === t.key
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'units' && <UnitRatesTable data={stats.unitRates} />}
            {tab === 'questions' && <HardestQuestions data={stats.questionRates} />}
            {tab === 'mastery' && (
              <MasteryGrid
                masteryByUnit={stats.masteryByUnit}
                totalStudents={stats.totalStudents}
                roster={stats.roster}
              />
            )}
            {tab === 'streaks' && (
              <StreakOverview roster={stats.roster} activeToday={stats.activeToday} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import SummaryStrip from './SummaryStrip';
import AtRiskList from './AtRiskList';
import DailyTrendChart from './DailyTrendChart';
import UnitRatesTable from './UnitRatesTable';
import HardestQuestions from './HardestQuestions';
import StudentRoster from './StudentRoster';
import StudentDetailDrawer from './StudentDetailDrawer';

interface RosterStudent {
  clientId: string;
  name: string;
  studentId: string;
  streak: number;
  masteredCount: number;
  lastSyncedAt: string;
  correctRate: number | null;
  totalAnswers: number;
  riskTags: string[];
  inactiveDays: number | null;
  unitTiers: Record<string, { level: string; label: string; mastered: boolean; bestScore: number | null }>;
  unitProgress: Record<string, { attempts: number; bestScore: number | null }>;
}

interface Stats {
  totalStudents: number;
  activeToday: number;
  overallCorrectRate: number;
  avgMasteredCount: number;
  dailyTrend: Array<{ date: string; activeStudents: number; totalAnswers: number; correctAnswers: number; correctRate: number }>;
  unitRates: Array<{ unit_code: string; total_answers: number; correct_answers: number; correct_rate: number; student_count: number }>;
  questionRates: Array<{ question_id: string; unit_code: string; question_text: string; attempts: number; correct_count: number; correct_rate: number }>;
  masteryByUnit: Record<string, number>;
  roster: RosterStudent[];
}

export default function TeacherDashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

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
      <header className="bg-surface/80 supports-[backdrop-filter]:bg-surface/70 backdrop-blur-md border-b border-border/70 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-12 flex items-center justify-between">
            <h1 className="font-bold text-primary text-lg tracking-tight">교사 대시보드</h1>
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

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-5">
        {error && (
          <div className="bg-error-light text-error text-sm rounded-xl p-3 text-center">{error}</div>
        )}

        {stats && (
          <>
            {/* ① Summary Strip */}
            <SummaryStrip
              totalStudents={stats.totalStudents}
              activeToday={stats.activeToday}
              overallCorrectRate={stats.overallCorrectRate}
              avgMasteredCount={stats.avgMasteredCount}
            />

            {/* ② At-Risk Students */}
            <AtRiskList
              roster={stats.roster}
              onStudentClick={setSelectedStudent}
            />

            {/* ③ Daily Trend */}
            <DailyTrendChart data={stats.dailyTrend} />

            {/* ④ Unit Rates */}
            <UnitRatesTable data={stats.unitRates} totalStudents={stats.totalStudents} />

            {/* ⑤ Hardest Questions */}
            <HardestQuestions data={stats.questionRates} />

            {/* ⑥ Student Roster */}
            <StudentRoster
              roster={stats.roster}
              onStudentClick={setSelectedStudent}
            />
          </>
        )}
      </div>

      {/* Student Detail Drawer */}
      <StudentDetailDrawer
        clientId={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import SummaryStrip from './SummaryStrip';
import AtRiskList from './AtRiskList';
import DailyTrendChart from './DailyTrendChart';
import UnitRatesTable from './UnitRatesTable';
import HardestQuestions from './HardestQuestions';
import StudentRoster from './StudentRoster';
import StudentDetailDrawer from './StudentDetailDrawer';
import ModeAnalytics from './ModeAnalytics';

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
  modeBreakdown: Array<{ mode: string; sessionCount: number; totalAnswers: number; correctRate: number }>;
  studyCompletions: Record<string, { dates: string[]; lastCompleted: string }>;
}

interface ModeRow {
  mode: string;
  sessionCount: number;
  studentCount: number;
  totalAnswers: number;
  correctRate: number;
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
  modeUsage: ModeRow[];
  totalStudyCompletions: number;
  studyByUnit: Record<string, number>;
}

type Tab = 'overview' | 'students' | 'units' | 'questions' | 'modes';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: 'overview',
    label: '개요',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    key: 'students',
    label: '학생',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    key: 'units',
    label: '단원',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    key: 'questions',
    label: '문항',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    key: 'modes',
    label: '모드',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    ),
  },
];

export default function TeacherDashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');

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

  const atRiskCount = stats?.roster.filter(s => s.riskTags.length > 0).length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface/80 supports-[backdrop-filter]:bg-surface/70 backdrop-blur-md border-b border-border/70 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-12 flex items-center justify-between">
            <h1 className="font-bold text-primary text-lg tracking-tight">교사 대시보드</h1>
            <div className="flex items-center gap-3">
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

          {/* Tab navigation */}
          <nav className="flex -mb-px">
            {TABS.map(t => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative flex items-center justify-center gap-1.5 flex-1 py-2.5 text-sm font-medium transition-colors ${
                    active ? 'text-primary' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                  {t.key === 'overview' && atRiskCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-error rounded-full">
                      {atRiskCount}
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-5">
        {error && (
          <div className="bg-error-light text-error text-sm rounded-xl p-3 text-center mb-4">{error}</div>
        )}

        {stats && (
          <>
            {tab === 'overview' && (
              <div className="space-y-5 animate-fade-in">
                <SummaryStrip
                  totalStudents={stats.totalStudents}
                  activeToday={stats.activeToday}
                  overallCorrectRate={stats.overallCorrectRate}
                  avgMasteredCount={stats.avgMasteredCount}
                />
                <AtRiskList
                  roster={stats.roster}
                  onStudentClick={setSelectedStudent}
                />
                <DailyTrendChart data={stats.dailyTrend} />
              </div>
            )}

            {tab === 'students' && (
              <div className="animate-fade-in">
                <StudentRoster
                  roster={stats.roster}
                  onStudentClick={setSelectedStudent}
                />
              </div>
            )}

            {tab === 'units' && (
              <div className="animate-fade-in">
                <UnitRatesTable data={stats.unitRates} totalStudents={stats.totalStudents} />
              </div>
            )}

            {tab === 'questions' && (
              <div className="animate-fade-in">
                <HardestQuestions data={stats.questionRates} />
              </div>
            )}

            {tab === 'modes' && (
              <div className="animate-fade-in">
                <ModeAnalytics
                  modeUsage={stats.modeUsage ?? []}
                  totalStudyCompletions={stats.totalStudyCompletions ?? 0}
                  studyByUnit={stats.studyByUnit ?? {}}
                />
              </div>
            )}
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

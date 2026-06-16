'use client';

interface Props {
  totalStudents: number;
  activeToday: number;
  overallCorrectRate: number;
  avgMasteredCount: number;
}

const cards = [
  { key: 'total', label: '등록 학생', color: 'text-text' },
  { key: 'active', label: '오늘 활동', color: 'text-primary' },
  { key: 'rate', label: '전체 정답률', color: 'text-success' },
  { key: 'mastery', label: '평균 마스터', color: 'text-warning' },
] as const;

export default function SummaryStrip({ totalStudents, activeToday, overallCorrectRate, avgMasteredCount }: Props) {
  const values: Record<string, string> = {
    total: `${totalStudents}명`,
    active: `${activeToday}명`,
    rate: `${overallCorrectRate}%`,
    mastery: `${avgMasteredCount}개`,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.key} className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] p-4 text-center">
          <p className={`text-2xl font-bold tabular-nums ${c.color}`}>{values[c.key]}</p>
          <p className="text-xs text-text-secondary mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

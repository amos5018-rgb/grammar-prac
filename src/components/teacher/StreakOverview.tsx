'use client';

interface RosterStudent {
  clientId: string;
  name: string;
  studentId: string;
  streak: number;
  masteredCount: number;
  lastSyncedAt: string;
}

export default function StreakOverview({
  roster,
  activeToday,
}: {
  roster: RosterStudent[];
  activeToday: number;
}) {
  const streakDist = [0, 0, 0, 0, 0]; // 0, 1-2, 3-6, 7-13, 14+
  for (const s of roster) {
    if (s.streak === 0) streakDist[0]++;
    else if (s.streak <= 2) streakDist[1]++;
    else if (s.streak <= 6) streakDist[2]++;
    else if (s.streak <= 13) streakDist[3]++;
    else streakDist[4]++;
  }

  const topStreaks = [...roster]
    .filter(s => s.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-bold text-text">학습 스트릭 분포</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            오늘 활동 학생: <span className="font-bold text-primary">{activeToday}명</span>
          </p>
        </div>
        <div className="p-4 grid grid-cols-5 gap-2">
          {['0일', '1~2일', '3~6일', '1~2주', '2주+'].map((label, i) => (
            <div key={label} className="text-center p-3 rounded-xl bg-background">
              <p className="text-2xl font-bold text-text">{streakDist[i]}</p>
              <p className="text-xs text-text-secondary mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {topStreaks.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-bold text-text">스트릭 TOP 10</h2>
          </div>
          <div className="divide-y divide-border">
            {topStreaks.map((s, i) => (
              <div key={s.clientId} className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-text-secondary w-5 text-right shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{s.name}</p>
                    <p className="text-xs text-text-secondary">{s.studentId}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary shrink-0">{s.streak}일 연속</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

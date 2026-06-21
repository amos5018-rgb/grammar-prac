'use client';

const MODE_LABELS: Record<string, string> = {
  full: '전부 풀기',
  random: '랜덤 풀기',
  'block-full': '블록 전부',
  'block-random': '블록 랜덤',
  wrong: '오답 모아풀기',
  'wrong-random': '오답 랜덤',
  due: '복습 예정',
  'top-wrong': '최다 오답',
  unknown: '(레거시)',
};

interface ModeRow {
  mode: string;
  sessionCount: number;
  studentCount: number;
  totalAnswers: number;
  correctRate: number;
}

interface Props {
  modeUsage: ModeRow[];
  totalStudyCompletions: number;
  studyByUnit: Record<string, number>;
}

export default function ModeAnalytics({ modeUsage, totalStudyCompletions, studyByUnit }: Props) {
  const totalSessions = modeUsage.reduce((s, r) => s + r.sessionCount, 0);
  const quizModes = modeUsage.filter(r => r.mode !== 'unknown');
  const sorted = [...quizModes].sort((a, b) => b.sessionCount - a.sessionCount);
  const studyEntries = Object.entries(studyByUnit).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-5">
      {/* Mode usage summary */}
      <div className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] p-5">
        <h3 className="text-lg font-bold mb-4">모드별 이용 현황</h3>
        {sorted.length === 0 ? (
          <p className="text-text-secondary text-sm">아직 모드 데이터가 없습니다. 학생들이 새 버전으로 풀이하면 수집됩니다.</p>
        ) : (
          <div className="space-y-3">
            {sorted.map(r => {
              const pct = totalSessions > 0 ? Math.round((r.sessionCount / totalSessions) * 100) : 0;
              return (
                <div key={r.mode}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{MODE_LABELS[r.mode] ?? r.mode}</span>
                    <span className="text-sm text-text-secondary">
                      {r.sessionCount}회 ({pct}%) · {r.studentCount}명
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      r.correctRate >= 80 ? 'bg-success-light text-success' :
                      r.correctRate >= 50 ? 'bg-warning-light text-warning' :
                      'bg-error-light text-error'
                    }`}>
                      {r.correctRate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mode effectiveness */}
      {sorted.length >= 2 && (
        <div className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] p-5">
          <h3 className="text-lg font-bold mb-3">모드별 정답률 비교</h3>
          <p className="text-sm text-text-secondary mb-4">
            어떤 모드에서 학생들이 가장 높은 정답률을 보이는지 비교합니다.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[...sorted].sort((a, b) => b.correctRate - a.correctRate).map(r => (
              <div
                key={r.mode}
                className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-border/50"
              >
                <div className="text-sm font-semibold mb-1">{MODE_LABELS[r.mode] ?? r.mode}</div>
                <div className={`text-2xl font-bold ${
                  r.correctRate >= 80 ? 'text-success' :
                  r.correctRate >= 50 ? 'text-warning' :
                  'text-error'
                }`}>
                  {r.correctRate}%
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  {r.totalAnswers}문항 · {r.studentCount}명
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study completion */}
      <div className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] p-5">
        <h3 className="text-lg font-bold mb-3">인출 연습 현황</h3>
        {totalStudyCompletions === 0 ? (
          <p className="text-text-secondary text-sm">아직 인출 연습 기록이 없습니다.</p>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-3">
              총 {totalStudyCompletions}회 학습 완료
            </p>
            <div className="space-y-2">
              {studyEntries.map(([code, count]) => (
                <div key={code} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{code}</span>
                  <span className="text-text-secondary">{count}회</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

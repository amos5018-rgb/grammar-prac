'use client';

interface RosterStudent {
  clientId: string;
  name: string;
  studentId: string;
  streak: number;
  masteredCount: number;
  lastSyncedAt: string;
}

const UNIT_NAMES: Record<string, string> = {
  'phoneme-basics': '음운의 개념과 환경',
  'consonant-system': '자음 체계',
  'final-consonants': '음절의 끝소리 규칙',
  'morpheme-basics': '형태소·조사·어미',
  'phoneme-change-types': '음운 변동의 개념과 유형',
  'nasal-liquid': '비음화와 유음화',
  'palatalization': '구개음화',
  'tensification-aspiration': '된소리되기와 거센소리되기',
  'deletion-addition': '음운의 탈락과 첨가',
  'honorifics': '높임 표현',
  'time-expression': '시간 표현',
  'passive-quotation': '피동 표현과 인용 표현',
  'phoneme-change-review': '음운 변동 총정리: 문제편',
  'phoneme-change-study': '음운 변동 총정리: 복습편',
  'advanced-basics': '고난도: 문법의 기초',
  'advanced-phoneme-change': '고난도: 음운의 변동',
  'advanced-grammar': '고난도: 문법 요소와 표현',
  'mixed-basics': '문법의 기초 섞어풀기',
  'mixed-phoneme-change': '음운의 변동 섞어풀기',
  'mixed-grammar-elements': '문법 요소와 표현 섞어풀기',
};

const TIER_CONFIG = [
  { level: 'master', label: '마스터', emoji: '👑', color: 'text-warning', bg: 'bg-warning-light' },
  { level: 'skilled', label: '숙련자', emoji: '💪', color: 'text-primary', bg: 'bg-primary-light' },
  { level: 'challenger', label: '도전자', emoji: '⭐', color: 'text-text-secondary', bg: 'bg-background' },
] as const;

export default function MasteryGrid({
  masteryByUnit,
  totalStudents,
  roster,
}: {
  masteryByUnit: Record<string, number>;
  totalStudents: number;
  roster: RosterStudent[];
}) {
  const unitEntries = Object.entries(UNIT_NAMES)
    .map(([code, name]) => ({
      code,
      name,
      mastered: masteryByUnit[code] ?? 0,
    }))
    .filter(u => u.mastered > 0)
    .sort((a, b) => b.mastered - a.mastered);

  const masterCountDist = [0, 0, 0, 0]; // 0, 1-3, 4-8, 9+
  for (const s of roster) {
    if (s.masteredCount === 0) masterCountDist[0]++;
    else if (s.masteredCount <= 3) masterCountDist[1]++;
    else if (s.masteredCount <= 8) masterCountDist[2]++;
    else masterCountDist[3]++;
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-bold text-text">학생별 마스터 분포</h2>
          <p className="text-xs text-text-secondary mt-0.5">마스터 달성 단원 수 기준</p>
        </div>
        <div className="p-4 grid grid-cols-4 gap-2">
          {['0개', '1~3개', '4~8개', '9개+'].map((label, i) => (
            <div key={label} className="text-center p-3 rounded-xl bg-background">
              <p className="text-2xl font-bold text-text">{masterCountDist[i]}</p>
              <p className="text-xs text-text-secondary mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-bold text-text">단원별 마스터 현황</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            전체 {totalStudents}명 중 마스터({TIER_CONFIG[0].emoji}) 달성 수
          </p>
        </div>
        {unitEntries.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-4">아직 마스터 달성 학생이 없습니다.</p>
        ) : (
          <div className="divide-y divide-border">
            {unitEntries.map(u => {
              const pct = totalStudents > 0 ? Math.round((u.mastered / totalStudents) * 100) : 0;
              return (
                <div key={u.code} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-text truncate">{u.name}</p>
                    <span className="text-sm text-text-secondary shrink-0 ml-2">
                      {u.mastered}명 ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

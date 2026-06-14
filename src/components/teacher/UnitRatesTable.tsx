'use client';

interface UnitRate {
  unit_code: string;
  total_answers: number;
  correct_answers: number;
  correct_rate: number;
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
  'advanced-basics-1': '고난도: 문법의 기초 1',
  'advanced-basics-2': '고난도: 문법의 기초 2',
  'advanced-basics-3': '고난도: 문법의 기초 3',
  'advanced-phoneme-change-1': '고난도: 음운의 변동 1',
  'advanced-phoneme-change-2': '고난도: 음운의 변동 2',
  'advanced-phoneme-change-3': '고난도: 음운의 변동 3',
  'advanced-grammar-1': '고난도: 문법 요소와 표현 1',
  'advanced-grammar-2': '고난도: 문법 요소와 표현 2',
  'advanced-grammar-3': '고난도: 문법 요소와 표현 3',
  'mixed-basics': '문법의 기초 섞어풀기',
  'mixed-phoneme-change': '음운의 변동 섞어풀기',
  'mixed-grammar-elements': '문법 요소와 표현 섞어풀기',
};

function rateColor(rate: number) {
  if (rate < 60) return 'text-error';
  if (rate < 80) return 'text-warning';
  return 'text-success';
}

function rateBg(rate: number) {
  if (rate < 60) return 'bg-error-light';
  if (rate < 80) return 'bg-warning-light';
  return 'bg-success-light';
}

export default function UnitRatesTable({ data }: { data: UnitRate[] }) {
  if (!data.length) {
    return <p className="text-sm text-text-secondary text-center py-4">아직 데이터가 없습니다.</p>;
  }

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-bold text-text">단원별 정답률</h2>
        <p className="text-xs text-text-secondary mt-0.5">낮은 순으로 정렬</p>
      </div>
      <div className="divide-y divide-border">
        {data.map(row => (
          <div key={row.unit_code} className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text truncate">
                {UNIT_NAMES[row.unit_code] ?? row.unit_code}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {row.correct_answers}/{row.total_answers}문항
              </p>
            </div>
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-sm font-bold ${rateColor(row.correct_rate)} ${rateBg(row.correct_rate)}`}>
              {row.correct_rate}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

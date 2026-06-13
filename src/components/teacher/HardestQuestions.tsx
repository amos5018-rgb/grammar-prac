'use client';

import { useState } from 'react';

interface QuestionRate {
  question_id: string;
  unit_code: string;
  question_text: string;
  attempts: number;
  correct_count: number;
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
  'advanced-basics': '고난도: 문법의 기초',
  'advanced-phoneme-change': '고난도: 음운의 변동',
  'advanced-grammar': '고난도: 문법 요소와 표현',
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

export default function HardestQuestions({ data }: { data: QuestionRate[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!data.length) {
    return <p className="text-sm text-text-secondary text-center py-4">아직 데이터가 없습니다.</p>;
  }

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-bold text-text">어려운 문항 TOP {data.length}</h2>
        <p className="text-xs text-text-secondary mt-0.5">정답률이 낮은 순</p>
      </div>
      <div className="divide-y divide-border">
        {data.map((row, i) => (
          <button
            key={row.question_id}
            onClick={() => setExpanded(expanded === row.question_id ? null : row.question_id)}
            className="w-full text-left px-4 py-3 hover:bg-background/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text">
                  <span className="text-text-secondary mr-1.5">#{i + 1}</span>
                  <span className="font-medium truncate">
                    {row.question_text || row.question_id}
                  </span>
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {UNIT_NAMES[row.unit_code] ?? row.unit_code} · {row.attempts}회 응시
                </p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-full text-sm font-bold ${rateColor(row.correct_rate)} ${rateBg(row.correct_rate)}`}>
                {row.correct_rate}%
              </span>
            </div>
            {expanded === row.question_id && row.question_text && (
              <p className="mt-2 text-sm text-text bg-background rounded-xl p-3 whitespace-pre-wrap">
                {row.question_text}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

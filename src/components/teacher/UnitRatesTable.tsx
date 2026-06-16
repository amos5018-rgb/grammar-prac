'use client';

import { useState } from 'react';
import { UNIT_NAMES, UNIT_CATEGORIES, CATEGORY_ORDER } from '@/data/unitNames';

interface UnitRate {
  unit_code: string;
  total_answers: number;
  correct_answers: number;
  correct_rate: number;
  student_count?: number;
}

interface Props {
  data: UnitRate[];
  totalStudents: number;
}

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

export default function UnitRatesTable({ data, totalStudents }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (!data.length) {
    return <p className="text-sm text-text-secondary text-center py-4">아직 데이터가 없습니다.</p>;
  }

  // Group by category
  const groups: Record<string, UnitRate[]> = {};
  for (const row of data) {
    const cat = UNIT_CATEGORIES[row.unit_code] ?? '기타';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(row);
  }

  const orderedCategories = [...CATEGORY_ORDER, '기타'].filter(c => groups[c]?.length);

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="bg-surface rounded-2xl border border-border/70 shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="px-4 py-3 border-b border-border/70">
        <h2 className="font-bold text-text">단원별 현황</h2>
        <p className="text-xs text-text-secondary mt-0.5">정답률 낮은 순 · 카테고리별 그룹</p>
      </div>

      {orderedCategories.map(cat => {
        const units = groups[cat];
        const isCollapsed = collapsed[cat];
        const avgRate = units.reduce((s, u) => s + u.correct_rate, 0) / units.length;

        return (
          <div key={cat}>
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-background/60 border-b border-border/50 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className={`w-3.5 h-3.5 text-text-secondary transition-transform ${isCollapsed ? '' : 'rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-bold text-text">{cat}</span>
                <span className="text-xs text-text-secondary">{units.length}개 단원</span>
              </div>
              <span className={`text-xs font-bold ${rateColor(avgRate)}`}>평균 {Math.round(avgRate)}%</span>
            </button>

            {!isCollapsed && (
              <div className="divide-y divide-border/50">
                {units.map(row => (
                  <div key={row.unit_code} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text truncate">
                        {UNIT_NAMES[row.unit_code] ?? row.unit_code}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {row.correct_answers}/{row.total_answers}문항
                        {row.student_count != null && (
                          <span className="ml-2">· {row.student_count}/{totalStudents}명 참여</span>
                        )}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-sm font-bold tabular-nums ${rateColor(row.correct_rate)} ${rateBg(row.correct_rate)}`}>
                      {row.correct_rate}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

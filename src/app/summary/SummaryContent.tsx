'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Unit } from '@/lib/types';
import { getUnitProgress, getCorrectQuestionIds, getUnitTierMap, UnitTier } from '@/lib/storage';
import { questionIdMap } from '@/data/questions/question-id-map';
import UnitCard from '@/components/UnitCard';

export interface SummaryGroup {
  categoryCode: string;
  title: string;
  units: Unit[];
}

type Progress = Record<string, { attempts: number; bestScore: number | null }>;

interface Props {
  groups: SummaryGroup[];
  questionCounts: Record<string, number>;
}

export default function SummaryContent({ groups, questionCounts }: Props) {
  const [progress, setProgress] = useState<Progress>({});
  const [coveredMap, setCoveredMap] = useState<Record<string, number>>({});
  const [tierMap, setTierMap] = useState<Record<string, UnitTier>>({});

  useEffect(() => {
    setProgress(getUnitProgress());
    setTierMap(getUnitTierMap());
    const correct = getCorrectQuestionIds();
    const cov: Record<string, number> = {};
    for (const g of groups) {
      for (const u of g.units) {
        if (u.study) continue;
        cov[u.code] = (questionIdMap[u.code] ?? []).filter(id => correct.has(id)).length;
      }
    }
    setCoveredMap(cov);
  }, [groups]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link href="/" className="text-sm text-text-secondary hover:text-primary mb-4 inline-block">
        &larr; 학습 영역 선택
      </Link>
      <h1 className="text-2xl font-bold mb-1 tracking-tight">시험 대비 총정리</h1>
      <p className="text-text-secondary text-sm mb-6">시험 전, 핵심만 빠르게 정리하세요</p>

      <div className="space-y-8">
        {groups.map(group => (
          <section key={group.categoryCode}>
            <h2 className="text-lg font-bold mb-4">{group.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.units.map((unit, i) => (
                <UnitCard
                  key={unit.code}
                  unit={unit}
                  questionCount={questionCounts[unit.code] || 0}
                  bestScore={progress[unit.code]?.bestScore ?? null}
                  attempts={progress[unit.code]?.attempts ?? 0}
                  covered={coveredMap[unit.code] ?? 0}
                  tier={tierMap[unit.code]}
                  index={i}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
